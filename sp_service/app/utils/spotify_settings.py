from spotipy.oauth2 import SpotifyOAuth
import requests
from requests.adapters import HTTPAdapter, Retry
import os
import pandas as pd
import pickle
from spotipy import Spotify, util
from dotenv import load_dotenv
from app.utils.parser import Parser, ParsedTrack
from app.utils.db_utils import create_track
from django.utils import timezone
from proj import settings
from tqdm import tqdm
import time
import logging

import json
from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta

load_dotenv()


from app.models import *


logger = logging.getLogger(__name__)


class SpotifyConn:
    def __init__(
        self,
        client_id="58faffc8452d44a2aa81e039544b8c0d",
        # client_id=os.getenv("CLIENT_ID"),
        client_secret="4e8ee3677d2a4f2c8975088c89c9ecec",
        # client_secret=os.getenv("CLIENT_SECRET"),
        auth_url="https://accounts.spotify.com/api/token",
        # auth_url=os.getenv("AUTH_URL"),
        username="juliansunn",
        # username=os.getenv("CLIENT_USERNAME"),
        # redirect_uri="http://localhost:3000/api/auth/callback/spotify",
        redirect_uri="http://localhost:8888/callback/",
        # redirect_uri=os.getenv("REDIRECT_URI"),
        path="my_data",
        picklefile="ids_added_in_db",
    ):
        self.scope = "user-read-recently-played"
        self.path = path
        self.picklefile = picklefile
        self.username = username
        self.client_id = client_id
        self.client_secret = client_secret
        self.auth_url = auth_url
        self.redirect_uri = redirect_uri
        self.token_info = self._get_token_info()

    @property
    def parsed(self):
        return Parser(response=self.recently_played())

    @property
    def token(self):
        return self._get_token_info()["access_token"]

    def _id_dict(self):
        try:
            ids = pickle.load(open(f"{self.path}/{self.picklefile}.pickle", "rb"))
        except (OSError, IOError):
            ids = {"in_db": set(), "not_found": {}}
            pickle.dump(ids, open(f"{self.path}/{self.picklefile}.pickle", "wb"))
        return ids

    @property
    def ids_in_db(self):
        return list(self._id_dict().get("in_db"))

    @property
    def ids_not_found(self):
        return list(self._id_dict().get("not_found"))

    @property
    def sp(self):
        return Spotify(auth=self.token_info.get("access_token"))

    def prompt_for_token(self):
        return util.prompt_for_user_token(
            username=self.username,
            scope=self.scope,
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
        )

    def recently_played(self, limit=50):
        return self.sp._get("me/player/recently-played", limit=limit)

    def _get_sp_auth(self):
        return SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope,
            cache_path=".cache-juliansunn",
        )

    def _get_token_info(self):
        try:
            sp_auth = self._get_sp_auth()
            token_info = None
            token_info = sp_auth.get_cached_token()
            if not token_info:
                auth_url = sp_auth.get_authorize_url()
                print(auth_url)
                res = input(
                    "Paste the above link in your browser,"
                    " then paste the redirect link here."
                )
                code = sp_auth.parse_response_code(res)
                token_info = sp_auth.get_access_token(code)
            if sp_auth.is_token_expired(token_info):
                token_info = sp_auth.refresh_access_token(token_info["refresh_token"])
            return token_info
        except Exception as e:
            print("ERROR getting token info: ", e)
            return None

    def add_data_to_db(self, historical_data=False, **kwargs):
        tracks = self.parsed.track_list
        not_found = {}

        if historical_data:
            tracks, not_found = self.run_historical_audit(**kwargs)
        for track in tracks:
            try:
                t, created = create_track(track)
                if created:
                    print(f"Created :{t} | Time: {timezone.now()}")
            except Exception as e:
                print(e, track.name)
        for k, v in not_found.items():
            print(f"{k} | {v}")
            print("_" * 40)

    def get_track(
        self,
        token: str,
        track_name: str = None,
        artist_name: str = None,
        played_at: str = None,
    ) -> dict:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        params = [
            ("q", track_name),
            ("type", "track"),
        ]
        try:
            retry_strategy = Retry(
                total=3,
                backoff_factor=4,
                status=[429, 500, 502, 503, 504],
                method_whitelist=["HEAD", "GET", "OPTIONS"],
            )
            adapter = HTTPAdapter(max_retries=retry_strategy)
            http = requests.Session()

            http.mount("https://", adapter)
            http.mount("http://", adapter)
            response = http.get(
                "https://api.spotify.com/v1/search",
                headers=headers,
                params=params,
                timeout=5,
            )
            json = response.json()
            tks = []
            track_items = json.get("tracks", {}).get("items", [])
            for trk in track_items:
                t = ParsedTrack(trk, played_at=played_at)
                artists = [artist.name for artist in t.artists]
                if artist_name in artists:
                    tks.append(t)
            if tks:
                return tks[0]
            if track_items:
                return ParsedTrack(track_items[0], played_at=played_at)
            return (track_name, artist_name, played_at, response.status_code)

        except Exception as e:
            print(
                f"{e} Track Name: {track_name} | Artist Name: {artist_name} | Played At: {played_at}"
            )
            return (track_name, artist_name, played_at, e)

    def run_historical_audit(self, **kwargs):
        token = self.token
        ids_in_db = []
        all_tracks = []
        tracks_not_found = {}
        streams, cnt = self.get_streaming_tracks_db_iterator(**kwargs)
        for t in tqdm(streams, total=cnt):
            track = self.get_track(
                token, t[1]["trackName"][:30], t[1]["artistName"], t[1]["endTime"]
            )
            if type(track) == tuple:
                if track[-1] not in tracks_not_found:
                    tracks_not_found[track[-1]] = []
                tracks_not_found[track[-1]].append(track)
            else:
                all_tracks.append(track)
                ids_in_db.append(t[1]["ID"])
            time.sleep(0.5)
        self.update_ids_in_db(ids_in_db, tracks_not_found)
        return all_tracks, tracks_not_found

    def update_ids_in_db(self, ids_in_db: list, tracks_not_found: dict):
        id_dict = self._id_dict()
        id_dict["in_db"] = set(list(id_dict["in_db"]) + ids_in_db)
        for k, v in tracks_not_found.items():
            if k not in id_dict["not_found"]:
                id_dict["not_found"][k] = []
            id_dict["not_found"][k].append(v)
        pickle.dump(id_dict, open(f"{self.path}/{self.picklefile}.pickle", "wb"))

    @property
    def hist_df(self):
        files = [
            f"{self.path}/{x}"
            for x in os.listdir(self.path)
            if x.split(".")[0][:-1] == "StreamingHistory"
        ]
        count = 1
        df = pd.DataFrame()
        for file in files:
            data = pd.read_json(file)
            for count, (r, c) in enumerate(data.iterrows(), start=count):
                data.at[r, "ID"] = int(count)
            data = data.astype({"ID": int})
            df = data if df.empty else pd.concat([df, data], ignore_index=True)
            count += 1
        return df

    def get_streaming_tracks_db_iterator(self, **kwargs):
        df = self.hist_df[~self.hist_df["ID"].isin(self.ids_in_db)]
        if subset := kwargs.get("subset"):
            first_idx = subset.get("from")
            last_idx = subset.get("to")
            df = df.iloc[first_idx:last_idx]
        return df.iterrows(), len(df.index)


class V2SpotifyConn:
    def __init__(
        self,
        client_id=os.getenv("CLIENT_ID"),
        client_secret=os.getenv("CLIENT_SECRET"),
        token_url=os.getenv("AUTH_TOKEN_URL"),
        auth_url=os.getenv("AUTH_URL"),
        redirect_uri=os.getenv("REDIRECT_URI"),
        data_path="my_data",
        picklefile="ids_added_in_db",
        username=os.getenv("CLIENT_USERNAME"),
        api_base_url="https://api.spotify.com/v1",
        scope=None,
    ):
        if scope is None:
            scope = [
                "user-modify-playback-state",
                "user-read-playback-state",
                "user-read-email",
                "user-read-private",
                "playlist-read-private",
                "user-library-read",
                "user-library-modify",
                "user-read-currently-playing",
                "user-read-recently-played",
                "playlist-read-collaborative",
                "user-top-read",
                "user-follow-read",
            ]
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.auth_url = auth_url
        self.redirect_uri = redirect_uri
        self.api_base_url = api_base_url
        self.data_path = data_path
        self.picklefile = picklefile
        self.username = username
        self.cache_file = f".cache-{self.username}"
        self.scope = scope
        self.sp_client = OAuth2Session(
            self.client_id, scope=self.scope, redirect_uri=self.redirect_uri
        )
        self.token = self._get_token_info()

    def refresh_token(self, cached_token_data: dict):
        token_data = self.sp_client.refresh_token(
            self.token_url,
            refresh_token=cached_token_data.get("refresh_token"),
            client_id=self.client_id,
            client_secret=self.client_secret,
        )
        return token_data

    def _get_token_info(self):
        if os.path.exists(self.cache_file):
            # Reading cache
            with open(self.cache_file, "r") as infile:
                cached_token_data = json.load(infile)

            # if int(datetime.now().timestamp()) > cached_token_data["expires_at"]:
            #     # Token expired, get new
            token_data = self.refresh_token(cached_token_data)
        else:
            #           No cached value, get and cache
            token_data = self.get_token()
        return token_data

    def get_token(self):
        # Redirect user to Spotify for authorization
        authorization_url, state = self.sp_client.authorization_url(self.auth_url)
        print("Please go here and authorize: ", authorization_url)
        redirect_response = input("Paste the full redirect URL here: ")
        auth = HTTPBasicAuth(self.client_id, self.client_secret)
        # Fetch the access token
        token = self.sp_client.fetch_token(
            self.token_url, auth=auth, authorization_response=redirect_response
        )
        print(token)
        with open(self.cache_file, "w") as outfile:
            json.dump(token, outfile)

    def recently_played(self):
        try:
            res = self.sp_client.get(f"{self.api_base_url}/me/player/recently-played")
            return res.json()
        except Exception as e:
            print(f"There was an error: {e}")
            return None

    @property
    def parsed(self):
        return Parser(response=self.recently_played())

    def add_data_to_db(self, historical_data=False, **kwargs):
        tracks = self.parsed.track_list
        not_found = {}

        if historical_data:
            tracks, not_found = self.un_historical_audit(**kwargs)
            for k, v in not_found.items():
                print(f"{k} | {v}")
                print("_" * 40)
        for track in tracks:
            try:
                t, created = create_track(track)
                if created:
                    print(f"Created :{t} | Time: {timezone.now()}")
            except Exception as e:
                print(e, track.name)
        

    def run_historical_audit(self, **kwargs):
        token = self.token.get("access_token")
        ids_in_db = []
        all_tracks = []
        tracks_not_found = {}
        streams, cnt = self.get_streaming_tracks_db_iterator(**kwargs)
        for t in tqdm(streams, total=cnt):
            track = self.get_track(
                token, t[1]["trackName"][:30], t[1]["artistName"], t[1]["endTime"]
            )
            if type(track) == tuple:
                if track[-1] not in tracks_not_found:
                    tracks_not_found[track[-1]] = []
                tracks_not_found[track[-1]].append(track)
            else:
                all_tracks.append(track)
                ids_in_db.append(t[1]["ID"])
            time.sleep(0.5)
        self.update_ids_in_db(ids_in_db, tracks_not_found)
        return all_tracks, tracks_not_found

    def get_streaming_tracks_db_iterator(self, **kwargs):
        df = self.hist_df[~self.hist_df["ID"].isin(self.ids_in_db)]
        if subset := kwargs.get("subset"):
            first_idx = subset.get("from")
            last_idx = subset.get("to")
            df = df.iloc[first_idx:last_idx]
        return df.iterrows(), len(df.index)

    @property
    def ids_in_db(self):
        return list(self._id_dict().get("in_db"))

    @property
    def ids_not_found(self):
        return list(self._id_dict().get("not_found"))

    @property
    def hist_df(self):
        files = [
            f"{self.data_path}/{x}"
            for x in os.listdir(self.data_path)
            if x.split(".")[0][:-1] == "StreamingHistory"
        ]
        count = 1
        df = pd.DataFrame()
        for file in files:
            data = pd.read_json(file)
            for count, (r, c) in enumerate(data.iterrows(), start=count):
                data.at[r, "ID"] = int(count)
            data = data.astype({"ID": int})
            df = data if df.empty else pd.concat([df, data], ignore_index=True)
            count += 1
        return df

    def get_track(
        self,
        token: str,
        track_name: str = None,
        artist_name: str = None,
        played_at: str = None,
    ) -> dict:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        params = [
            ("q", track_name),
            ("type", "track"),
        ]
        try:
            retry_strategy = Retry(
                total=3,
                backoff_factor=4,
                status=[429, 500, 502, 503, 504],
                method_whitelist=["HEAD", "GET", "OPTIONS"],
            )
            adapter = HTTPAdapter(max_retries=retry_strategy)
            http = requests.Session()

            http.mount("https://", adapter)
            http.mount("http://", adapter)
            response = http.get(
                f"{self.api_base_url}/search",
                headers=headers,
                params=params,
                timeout=5,
            )
            json = response.json()
            tks = []
            track_items = json.get("tracks", {}).get("items", [])
            for trk in track_items:
                t = ParsedTrack(trk, played_at=played_at)
                artists = [artist.name for artist in t.artists]
                if artist_name in artists:
                    tks.append(t)
            if tks:
                return tks[0]
            if track_items:
                return ParsedTrack(track_items[0], played_at=played_at)
            return (track_name, artist_name, played_at, response.status_code)

        except Exception as e:
            print(
                f"{e} Track Name: {track_name} | Artist Name: {artist_name} | Played At: {played_at}"
            )
            return (track_name, artist_name, played_at, e)

    def update_ids_in_db(self, ids_in_db: list, tracks_not_found: dict):
        id_dict = self._id_dict()
        id_dict["in_db"] = set(list(id_dict["in_db"]) + ids_in_db)
        for k, v in tracks_not_found.items():
            if k not in id_dict["not_found"]:
                id_dict["not_found"][k] = []
            id_dict["not_found"][k].append(v)
        pickle.dump(id_dict, open(f"{self.data_path}/{self.picklefile}.pickle", "wb"))

    def _id_dict(self):
        try:
            ids = pickle.load(open(f"{self.data_path}/{self.picklefile}.pickle", "rb"))
        except Exception as e:
            print(f"Exception: {e} occurred when trying to open the pickle file {self.data_path}/{self.picklefile}.pickle")
            ids = {"in_db": set(), "not_found": {}}
            pickle.dump(ids, open(f"{self.data_path}/{self.picklefile}.pickle", "wb"))
        return ids
