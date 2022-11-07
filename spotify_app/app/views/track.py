from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from app.models import Track, play_history
from app.serializers import TrackSerializer
from django.db.models import Count
from rest_framework.response import Response
from app.pagination import StandardResultsSetPagination
from rest_framework.pagination import PageNumberPagination


class TrackView(viewsets.ReadOnlyModelViewSet):
    """List all Tracks"""

    # pagination_class = PageNumberPagination
    serializer_class = TrackSerializer

    def get_queryset(self):
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        return Track.objects.all()
        # return Track.objects.filter(
        #     play_history__played_at__range=(seven_days_ago, now)
        # )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        # s = [{"track": t} for t in serializer.data]
        # serializer.data = s
        return Response(serializer.data)
