from rest_framework import serializers
from app.models import *
from app.serializers.album import AlbumSerializer
from app.serializers.artist import ArtistSerializer


class TrackSerializer(serializers.ModelSerializer):
    # play_history = PlayHistorySerializer(many=True, read_only=True)
    album = AlbumSerializer(read_only=True)
    artists = ArtistSerializer(many=True, source="artist_tracks")
    play_cnt = serializers.ReadOnlyField()
    last_play = serializers.ReadOnlyField()
    added_at = serializers.CharField(read_only=True, source="play_history.added_at")

    class Meta:
        model = Track
        fields = [
            "id",
            "spotify_id",
            "name",
            "added_at",
            "href",
            "uri",
            "duration_ms",
            "popularity",
            "album",
            "last_play",
            "play_cnt",
            "artists",
        ]
