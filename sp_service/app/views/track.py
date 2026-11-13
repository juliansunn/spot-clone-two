from app.models import Track
from app.serializers import TrackSerializer
from app.views.mixins import PaginatedAuthMixin


class TrackViewSet(PaginatedAuthMixin):
    """Tracks the current user has played (previously listed every user's tracks)."""

    serializer_class = TrackSerializer

    def get_queryset(self):
        return (
            Track.objects.filter(play_history__user=self.get_user())
            .distinct()
            .select_related("album")
            .prefetch_related("album__album_images", "album__artists", "artist_tracks")
            .order_by("name")
        )
