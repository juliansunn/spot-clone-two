import requests
from requests.adapters import HTTPAdapter, Retry
import os
import pandas as pd
import pickle
from dotenv import load_dotenv
from app.utils.parser import Parser, ParsedTrack
from app.utils.db_utils import create_track
from core.models import User
from django.utils import timezone
from tqdm import tqdm
import time
import logging

from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth

load_dotenv()


from app.models import *


logger = logging.getLogger(__name__)

class SpotifyConn:
    def __init__(
        self,
        client_id=os.getenv("NEXT_PUBLIC_CLIENT_ID"),
        client_secret=os.getenv("NEXT_PUBLIC_CLIENT_SECRET"),
        token_url=os.getenv("AUTH_TOKEN_URL"),
        auth_url=os.getenv("AUTH_URL"),
        redirect_uri=os.getenv("REDIRECT_URI"),
        data_path="my_data",
        picklefile="ids_added_in_db",
        username=os.getenv("CLIENT_USERNAME"),
        api_base_url="https://api.spotify.com/v1",
        scope=None,
        token=None,
        user_id=None
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
        self.scope = scope
        self.user_id = user_id
        self.sp_client = OAuth2Session(
            self.client_id, scope=self.scope, redirect_uri=self.redirect_uri
        )
        self.token = token
        self.access_token = self._get_token_info()

    def refresh_token(self, cached_token_data: dict):
        return self.sp_client.refresh_token(
            self.token_url,
            refresh_token=cached_token_data.get("refresh_token"),
            client_id=self.client_id,
            client_secret=self.client_secret,
        )

    def _get_token_info(self):
        return self.refresh_token(self.token) if self.token else self.get_token()


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


    def recently_played(self):
        return self.get_query("/me/player/recently-played")
    
    def get_query(self, url: str):
        try:
            res = self.sp_client.get(f"{self.api_base_url}{url}")
            return res.json()
        except Exception as e:
            print(f"There was an error: {e}")
            raise e

    @property
    def parsed(self):
        return Parser(response=self.recently_played())

    def add_data_to_db(self, historical_data=False, **kwargs):
        tracks = self.parsed.track_list
        user = User.objects.filter(pk=self.user_id)
        not_found = {}

        if historical_data:
            tracks, not_found = self.run_historical_audit(**kwargs)
            for k, v in not_found.items():
                print(f"{k} | {v}")
                print("_" * 40)
        for track in tracks:
            try:
                t, created = create_track(track, user)
                if created:
                    print(f"Created :{t} | Time: {timezone.now()}")
            except Exception as e:
                print(e, track.name)
        

    def run_historical_audit(self, **kwargs):
        token = self.access_token.get("access_token")
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
