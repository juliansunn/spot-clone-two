from rest_framework import serializers
from spotify_app.models import PlayHistory


class PlayHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayHistory
        fields = ["played_at", "track", "user"]
