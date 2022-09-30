from rest_framework import viewsets
from spotify_app.models import Artist
from spotify_app.serializers import ArtistSerializer


class ArtistView(viewsets.ModelViewSet):
    """List all Tracks"""
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer