from rest_framework import serializers
from spotify_app.models import *
from spotify_app.serializers.album import AlbumSerializer
from spotify_app.serializers.play_history import PlayHistorySerializer


class TrackSerializer(serializers.ModelSerializer):
    # play_history = PlayHistorySerializer(many=True, read_only=True)
    album = AlbumSerializer(read_only=True)
    play_count = serializers.ReadOnlyField()
    last_played_at = serializers.ReadOnlyField()

    class Meta:
        model = Track
        fields = [
            "name",
            "href",
            "uri",
            "duration",
            "popularity",
            "album",
            "album",
            "last_played_at",
            "play_count",
        ]
