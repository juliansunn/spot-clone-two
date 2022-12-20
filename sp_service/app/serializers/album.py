from rest_framework import serializers
from app.models import Album
from app.serializers.artist import ArtistSerializer
from app.serializers.image import ImageSerializer


class AlbumSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, source="album_images")
    artists = ArtistSerializer(many=True)

    class Meta:
        model = Album
        depth = 1
        fields = [
            "name",
            "release_date",
            "artists",
            "total_tracks",
            "artists",
            "images",
        ]
