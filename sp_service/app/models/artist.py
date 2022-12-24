from django.db import models
from .spotify_search import SpotifySearch


class Artist(SpotifySearch):
    tracks = models.ManyToManyField('Track', related_name='artist_tracks', null=True, blank=True)
    genre = models.ManyToManyField("Genre", related_name="artists", null=True, blank=True)


    def __str__(self):
        return self.name


