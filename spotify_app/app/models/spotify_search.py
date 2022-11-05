from django.db import models



class SpotifySearch(models.Model):
    name = models.CharField(max_length=200)
    href = models.URLField(max_length=100, null=True)
    spotify_id = models.CharField(max_length=50, null=True, help_text="Search spotify API with this ID for Data.")
    uri = models.CharField(max_length=100, null=True)

    class Meta:
        abstract = True