from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from app.models import Track, play_history
from app.serializers import TrackSerializer
from django.db.models import Count
from rest_framework.response import Response
from app.pagination import StandardResultsSetPagination
from rest_framework.pagination import PageNumberPagination

from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            "type": "history",
            'results': data
        })

class TrackView(viewsets.ReadOnlyModelViewSet):
    """List all Tracks"""

    pagination_class = StandardResultsSetPagination
    serializer_class = TrackSerializer

    def get_queryset(self):
        
        return Track.objects.all().order_by("-play_history__played_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
