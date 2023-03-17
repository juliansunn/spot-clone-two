from rest_framework import viewsets
from app.models import Album
from app.serializers import AlbumSerializer


class AlbumViewSet(viewsets.ModelViewSet):
    """List all Albums"""

    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
