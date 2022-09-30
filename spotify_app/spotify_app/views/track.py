from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from spotify_app.models import Track, play_history
from spotify_app.serializers import TrackSerializer
from django.db.models import Count


class TrackView(viewsets.ReadOnlyModelViewSet):
    """List all Tracks"""

    def get_queryset(self):
        now = timezone.now()
        seven_days_ago = now - timedelta(days=70)
        return (
            Track.objects.annotate(play_count=Count("play_history"))
            .filter(play_history__played_at__range=(seven_days_ago, now))
            .order_by("-play_count")
        )

    serializer_class = TrackSerializer
