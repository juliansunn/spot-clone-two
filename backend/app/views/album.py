from rest_framework import viewsets
from app.models import Album
from app.serializers import AlbumSerializer


class AlbumView(viewsets.ModelViewSet):
    """List all Tracks"""
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer