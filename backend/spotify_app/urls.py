from django.urls import path, include
from spotify_app.views import (
    track,
    artist,
    album,
    play_history,
)
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"tracks", track.TrackView, basename="tracks")
router.register(r"artists", artist.ArtistView, basename="artists")
router.register(r"albums", album.AlbumView, basename="albums")
router.register(r"play-history", play_history.PlayHistoryView, basename="play_history")

urlpatterns = [path("", include(router.urls))]
