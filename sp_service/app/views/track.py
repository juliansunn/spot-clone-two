
from rest_framework import viewsets
from app.models import Track
from app.serializers import TrackSerializer
from rest_framework.response import Response
from app.views.mixins import PaginatedAuthMixin


class TrackViewSet(PaginatedAuthMixin):
    """List all Tracks"""
    
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
        
