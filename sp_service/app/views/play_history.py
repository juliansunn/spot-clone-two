from datetime import datetime
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils.timezone import make_aware
from rest_framework import viewsets
from app.models import PlayHistory
from app.serializers import PlayHistorySerializer
from app.views.track import StandardResultsSetPagination


class PlayHistoryView(viewsets.ModelViewSet):
    """List all PlayHistory Tracks"""

    serializer_class = PlayHistorySerializer
    pagination_class = StandardResultsSetPagination

    def aware_dates(self):
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        start = make_aware(datetime.strptime(start_date, '%Y-%m-%d'))
        end = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) + timedelta(days=1)
        return start, end

    def get_queryset(self):
        playhistory_queryset = PlayHistory.objects.annotate(
            play_date=TruncDate('played_at')
        ).values('play_date').annotate(
            play_count=Count('play_date')
        )
        return PlayHistory.objects.filter(played_at__range=(self.aware_dates())).order_by("-played_at")
    
    


