from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import viewsets
from app.models import Track
from app.serializers import TrackSerializer
from app.views.mixins import PaginatedAuthMixin


class PlayHistoryViewSet(viewsets.ModelViewSet, PaginatedAuthMixin):
    """List all PlayHistory Tracks"""
    serializer_class = TrackSerializer

    def aware_dates(self):
        now = timezone.now()
        start_date = self.request.query_params.get("start_date", (now - timedelta(days=7)).strftime("%Y-%m-%d"))
        end_date = self.request.query_params.get("end_date", now.strftime("%Y-%m-%d"))
        start = timezone.make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end = timezone.make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        return start, end

    def get_queryset(self):
        return Track.objects.filter(
            play_history__user=self.get_user(),
            play_history__played_at__range=(self.aware_dates()),
        ).annotate_play_count_by_date()
