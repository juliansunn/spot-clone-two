from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from app.models import Track
from app.serializers import TrackSerializer
from app.views.track import StandardResultsSetPagination


class PlayHistoryViewSet(viewsets.ModelViewSet):
    """List all PlayHistory Tracks"""
    permission_classes = (IsAuthenticated,)
    serializer_class = TrackSerializer
    pagination_class = StandardResultsSetPagination

    def aware_dates(self):
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        start = make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        return start, end

    def get_queryset(self):
        queryset = Track.objects.filter(play_history__user=self.request.user, play_history__played_at__range=(self.aware_dates())).annotate_play_count_by_date()
        return queryset
 
    
    


