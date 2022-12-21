from rest_framework import serializers
from app.models import PlayHistory
from app.serializers.track import TrackSerializer


class PlayHistorySerializer(serializers.ModelSerializer):
    track = TrackSerializer(read_only=True)    
    class Meta:
        model = PlayHistory
        fields = ["played_at", "track", "user"]
