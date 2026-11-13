from app.models import Artist
from app.serializers import ArtistSerializer
from app.views.mixins import PaginatedAuthMixin


class ArtistViewSet(PaginatedAuthMixin):
    """Read-only list of artists (was a writable ModelViewSet)."""

    queryset = Artist.objects.all().order_by("name")
    serializer_class = ArtistSerializer
