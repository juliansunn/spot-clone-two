from django.db import models


class Image(models.Model):
    height = models.IntegerField(null=True)
    width = models.IntegerField(null=True)
    url = models.URLField(max_length=100, default=None)
    album = models.ForeignKey('Album', related_name='album_images', on_delete=models.PROTECT, null=True)

    def __str__(self):
        return self.album.name