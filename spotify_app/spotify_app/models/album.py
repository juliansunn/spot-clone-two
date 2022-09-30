from django.db import models
from .spotify_search import SpotifySearch


class Album(SpotifySearch):
    release_date = models.DateField(null=True)
    artists = models.ManyToManyField('Artist', related_name='artist_albums')
    total_tracks = models.IntegerField(null=True)



    def __str__(self):
        return self.name
