from django.db import models
from .spotify_search import SpotifySearch


class Artist(SpotifySearch):
    tracks = models.ForeignKey('Track', related_name='artist_tracks', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


