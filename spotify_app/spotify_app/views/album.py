from rest_framework import viewsets
from spotify_app.models import Album
from spotify_app.serializers import AlbumSerializer


class AlbumView(viewsets.ModelViewSet):
    """List all Tracks"""
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer