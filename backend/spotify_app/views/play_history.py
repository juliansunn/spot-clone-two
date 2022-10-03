from rest_framework import viewsets
from spotify_app.models import PlayHistory
from spotify_app.serializers import PlayHistorySerializer


class PlayHistoryView(viewsets.ModelViewSet):
    """List all Tracks"""

    queryset = PlayHistory.objects.all()
    serializer_class = PlayHistorySerializer
