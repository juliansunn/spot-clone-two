from app.models import Album
from app.serializers import AlbumSerializer
from app.views.mixins import PaginatedAuthMixin


class AlbumViewSet(PaginatedAuthMixin):
    """Read-only list of albums (was a writable ModelViewSet)."""

    queryset = Album.objects.all().prefetch_related("album_images", "artists").order_by("name")
    serializer_class = AlbumSerializer
