from django.db import models
from django.db.models import Count, Max
from app.utils.db_utils import convert_to_local_time
from .spotify_search import SpotifySearch


class TrackQuerySet(models.query.QuerySet):
    def recently_played_tracks(self, n: int = 10) -> list:
        return self.order_by("-play_history__played_at")[:n]
    
    def annotate_play_count_by_date(self):
        return self.annotate(
            last_play=Max('play_history__played_at'),
            play_cnt=Count('play_history')
        ).order_by("-last_play", "-play_cnt")


class Track(SpotifySearch):
    album = models.ForeignKey(
        "Album", related_name="album_tracks", on_delete=models.CASCADE, null=True
    )
    disc_number = models.IntegerField(null=True)
    duration_ms = models.IntegerField(null=True)
    popularity = models.IntegerField(null=True)
    preview_url = models.URLField(null=True)
    track_number = models.IntegerField(null=True)
    
    objects = TrackQuerySet.as_manager()

    @property
    def artists(self):
        return self.album.artists.all()

    @property
    def last_played_at(self):
        utc_time = self.play_history.order_by("-played_at").first().played_at
        return convert_to_local_time(utc_time)

    @property
    def play_count(self):
        return self.play_history.count()

    def __str__(self):
        return f"{self.name}"
