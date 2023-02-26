from re import L
from django.contrib import admin
from . import models
from django.utils.html import format_html


@admin.register(models.Artist)
class ArtistAdmin(admin.ModelAdmin):
    pass

@admin.register(models.Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = (
        'short_name',
        'get_recently_played',
        'short_album',
        'play_song',
    )

    search_fields = (
        'name',
    )
    ordering = (
        'name',
    )

    def short_name(self, obj):
        return obj.name[:30]

    def play_song(self, obj):
        iframe = f'<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/{obj.spotify_id}?utm_source=generator&theme=0" width="70%" height="70" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>'
        return format_html(iframe)

    def short_album(self, obj):
        return obj.album.name[:30]

    @admin.display(ordering='play_history', description='Last Played')
    def get_recently_played(self, obj):
        play_history = obj.play_history.last()
        return play_history.played_at if play_history else None

@admin.register(models.Album)
class AlbumAdmin(admin.ModelAdmin):
    pass

@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):
    pass

@admin.register(models.PlayHistory)
class PlayHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'track',
        'played_at',
    )