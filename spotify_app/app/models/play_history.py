from django.db import models
from django.conf import settings


class PlayHistoryManager(models.Manager):
    def get_latest_tracks(self, n: int = 10) -> list:
        return self.order_by("-played_at")[:n]


class PlayHistory(models.Model):
    added_at = models.DateTimeField(auto_now=True)
    played_at = models.DateTimeField()
    track = models.ForeignKey(
        "Track", related_name="play_history", on_delete=models.CASCADE, null=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="user_play_history",
        on_delete=models.CASCADE,
        null=True,
    )
    objects = PlayHistoryManager()

    class Meta:
        unique_together = ("track", "played_at")

    def __str__(self):
        return f"{self.track.name} | {self.track.artists.first().name}"
