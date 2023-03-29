from rest_framework import viewsets
from app.models import Album
from app.serializers import AlbumSerializer
from app.views.mixins import PaginatedAuthMixin


class AlbumViewSet(viewsets.ModelViewSet, PaginatedAuthMixin):
    """List all Albums"""

    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
