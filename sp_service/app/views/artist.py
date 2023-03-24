from rest_framework import viewsets
from app.models import Artist
from app.serializers import ArtistSerializer
from app.views.mixins import PaginatedAuthMixin


class ArtistViewSet(viewsets.ModelViewSet, PaginatedAuthMixin):
    """List all Artists"""

    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
