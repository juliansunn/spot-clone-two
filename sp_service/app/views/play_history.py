from datetime import datetime, timedelta

from django.db.models import Count, Max, Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from app.models import Track
from app.serializers import TrackSerializer
from app.views.mixins import PaginatedAuthMixin

MAX_RANGE_DAYS = 366 * 3


class PlayHistoryViewSet(PaginatedAuthMixin):
    """Tracks the current user played in a date range, with play counts."""

    serializer_class = TrackSerializer

    def _parse(self, name, default):
        value = self.request.query_params.get(name) or default
        try:
            return datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise ValidationError({name: "Expected a date in YYYY-MM-DD format."})

    def aware_dates(self):
        today = timezone.localdate()
        start = self._parse("start_date", (today - timedelta(days=7)).isoformat())
        end = self._parse("end_date", today.isoformat())
        if start > end:
            start, end = end, start
        if (end - start).days > MAX_RANGE_DAYS:
            raise ValidationError({"start_date": f"Range may not exceed {MAX_RANGE_DAYS} days."})
        # End date is inclusive.
        return timezone.make_aware(start), timezone.make_aware(end) + timedelta(days=1)

    def get_queryset(self):
        start, end = self.aware_dates()
        # A single condition object so the user + date constraints apply to the
        # *same* play. Previously two chained .filter() calls on the multi-valued
        # relation matched tracks played by anyone in range and by the user ever,
        # and counted plays outside the range/by other users.
        plays = Q(play_history__user=self.get_user(), play_history__played_at__gte=start, play_history__played_at__lt=end)
        return (
            Track.objects.filter(plays)
            .annotate(last_play=Max("play_history__played_at", filter=plays), play_cnt=Count("play_history", filter=plays))
            .order_by("-last_play", "-play_cnt")
            .distinct()
            .select_related("album")
            .prefetch_related("album__album_images", "album__artists", "artist_tracks")
        )
