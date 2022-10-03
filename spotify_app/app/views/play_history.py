from rest_framework import viewsets
from app.models import PlayHistory
from app.serializers import PlayHistorySerializer


class PlayHistoryView(viewsets.ModelViewSet):
    """List all Tracks"""

    queryset = PlayHistory.objects.all()
    serializer_class = PlayHistorySerializer