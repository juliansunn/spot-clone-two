from rest_framework import serializers
from app.models import Artist


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["name", "href", "spotify_id", "uri"]
