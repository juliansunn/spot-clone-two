from rest_framework import serializers
from spotify_app.models import Album

class AlbumSerializer(serializers.ModelSerializer):

    class Meta:
        model = Album
        fields = '__all__'