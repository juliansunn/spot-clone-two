from rest_framework import serializers
from app.models import *
from app.serializers.album import AlbumSerializer
from app.serializers.play_history import PlayHistorySerializer


class TrackSerializer(serializers.ModelSerializer):
    # play_history = PlayHistorySerializer(many=True, read_only=True)
    album = AlbumSerializer(read_only=True)
    play_count = serializers.ReadOnlyField()
    last_played_at = serializers.ReadOnlyField()

    class Meta:
        model = Track
        fields = [
            "id",
            "name",
            "href",
            "uri",
            "duration",
            "popularity",
            "album",
            "last_played_at",
            "play_count",
        ]
