from rest_framework import viewsets
from app.models import Artist
from app.serializers import ArtistSerializer


class ArtistView(viewsets.ModelViewSet):
    """List all Artists"""

    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
