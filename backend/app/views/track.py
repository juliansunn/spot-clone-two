from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from app.models import Track, play_history
from app.serializers import TrackSerializer
from django.db.models import Count


class TrackView(viewsets.ReadOnlyModelViewSet):
    """List all Tracks"""

    serializer_class = TrackSerializer

    def get_queryset(self):
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        print(now, seven_days_ago)
        # return Track.objects.all()
        return Track.objects.filter(
            play_history__played_at__range=(seven_days_ago, now)
        )
