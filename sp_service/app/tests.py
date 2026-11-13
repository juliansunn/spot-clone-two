from datetime import timedelta
from unittest import mock

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from app.models import Album, Artist, PlayHistory, Track
from app.utils.db_utils import create_track
from app.utils.parser import ParsedTrack
from core.models import User

PROFILES = {
    "good-token": {"id": "alice-sp", "display_name": "Alice Example", "email": "alice@example.com"},
    "bob-token": {"id": "bob-sp", "display_name": "Bob"},  # 2026 Dev Mode: no email
}


def fake_spotify_get(url, headers=None, timeout=None):
    token = headers["Authorization"].split(" ", 1)[1]
    res = mock.Mock()
    if token in PROFILES:
        res.status_code = 200
        res.json.return_value = PROFILES[token]
    else:
        res.status_code = 401
        res.json.return_value = {"error": {"status": 401}}
    return res


@override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
@mock.patch("app.tasks.schedule_spotify_data_to_db_task")
@mock.patch("core.auth.spotify_auth.requests.get", side_effect=fake_spotify_get)
class PlayHistoryApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.alice = User.objects.create(email="alice@example.com")
        self.bob = User.objects.create(email="bob-legacy@example.com", spotify_id="bob-sp")
        album = Album.objects.create(name="Album", spotify_id="al1")
        self.t1 = Track.objects.create(name="One", spotify_id="t1", album=album)
        self.t2 = Track.objects.create(name="Two", spotify_id="t2", album=album)
        Artist.objects.create(name="Artist", spotify_id="ar1").tracks.add(self.t1, self.t2)
        now = timezone.now()
        # Alice: t1 twice in range, once 30 days ago. t2 only 30 days ago.
        PlayHistory.objects.create(track=self.t1, user=self.alice, played_at=now - timedelta(hours=1))
        PlayHistory.objects.create(track=self.t1, user=self.alice, played_at=now - timedelta(days=2))
        PlayHistory.objects.create(track=self.t1, user=self.alice, played_at=now - timedelta(days=30))
        PlayHistory.objects.create(track=self.t2, user=self.alice, played_at=now - timedelta(days=30))
        # Bob played t2 recently – must not leak into Alice's history.
        PlayHistory.objects.create(track=self.t2, user=self.bob, played_at=now - timedelta(hours=2))

    def get(self, token=None, **params):
        headers = {"HTTP_AUTHORIZATION": f"Spotify {token}"} if token else {}
        return self.client.get("/sp-api/play-history/", params, **headers)

    def test_spoofed_email_header_is_rejected(self, *_):
        # The old permission trusted an `email` header plus arbitrary tokens.
        res = self.client.get(
            "/sp-api/play-history/", HTTP_EMAIL="alice@example.com", HTTP_AUTHORIZATION="whatever|whatever"
        )
        self.assertIn(res.status_code, (401, 403))
        self.alice.refresh_from_db()
        self.assertEqual(self.alice.token_data, {})

    def test_invalid_token_is_rejected(self, *_):
        self.assertEqual(self.get("bad-token").status_code, 401)

    def test_history_only_counts_own_plays_in_range(self, *_):
        res = self.get("good-token")
        self.assertEqual(res.status_code, 200, res.content)
        results = res.json()["results"]
        self.assertEqual([r["spotify_id"] for r in results], ["t1"])
        self.assertEqual(results[0]["play_cnt"], 2)

    def test_wider_range_includes_older_plays(self, *_):
        start = (timezone.localdate() - timedelta(days=60)).isoformat()
        results = self.get("good-token", start_date=start)
        counts = {r["spotify_id"]: r["play_cnt"] for r in results.json()["results"]}
        self.assertEqual(counts, {"t1": 3, "t2": 1})

    def test_bad_date_is_a_400_not_a_500(self, *_):
        self.assertEqual(self.get("good-token", start_date="yesterday").status_code, 400)

    def test_user_matched_by_spotify_id_without_email(self, *_):
        res = self.get("bob-token")
        self.assertEqual(res.status_code, 200)
        self.assertEqual([r["spotify_id"] for r in res.json()["results"]], ["t2"])
        self.assertEqual(User.objects.filter(spotify_id="bob-sp").count(), 1)

    def test_refresh_token_is_stored(self, *_):
        self.client.get(
            "/sp-api/play-history/", HTTP_AUTHORIZATION="Spotify good-token", HTTP_X_SPOTIFY_REFRESH_TOKEN="r1"
        )
        self.alice.refresh_from_db()
        self.assertEqual(self.alice.spotify_id, "alice-sp")
        self.assertEqual(self.alice.token_data, {"access_token": "good-token", "refresh_token": "r1"})

    def test_catalog_endpoints_are_read_only(self, *_):
        auth = {"HTTP_AUTHORIZATION": "Spotify good-token"}
        for url in ("/sp-api/tracks/", "/sp-api/artists/", "/sp-api/albums/", "/sp-api/play-history/"):
            self.assertEqual(self.client.post(url, {"name": "x"}, **auth).status_code, 405, url)
        self.assertEqual(self.client.delete(f"/sp-api/tracks/{self.t1.pk}/", **auth).status_code, 405)

    def test_tracks_endpoint_is_scoped_to_user(self, *_):
        res = self.client.get("/sp-api/tracks/", HTTP_AUTHORIZATION="Spotify bob-token")
        self.assertEqual([r["spotify_id"] for r in res.json()["results"]], ["t2"])


class CreateTrackTests(TestCase):
    def payload(self, popularity, played_at):
        return {
            "played_at": played_at,
            "track": {
                "id": "trk", "name": "Song", "uri": "spotify:track:trk", "popularity": popularity,
                "duration_ms": 1000, "artists": [{"id": "a1", "name": "A"}],
                "album": {"id": "alb", "name": "Alb", "release_date": "2020-05", "artists": [{"id": "a1", "name": "A"}], "images": []},
            },
        }

    def test_changing_metadata_does_not_duplicate_rows(self):
        user = User.objects.create(email="u@example.com")
        create_track(ParsedTrack(self.payload(50, "2024-01-01T00:00:00Z")), user)
        create_track(ParsedTrack(self.payload(None, "2024-01-02T00:00:00Z")), user)
        self.assertEqual(Track.objects.count(), 1)
        self.assertEqual(Album.objects.count(), 1)
        self.assertEqual(Artist.objects.count(), 1)
        self.assertEqual(PlayHistory.objects.count(), 2)
        self.assertEqual(str(Album.objects.get().release_date), "2020-05-01")
