from django.urls import path, include
from app.views import (
    track,
    artist,
    album,
    play_history,
)
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"tracks", track.TrackViewSet, basename="tracks")
router.register(r"artists", artist.ArtistViewSet, basename="artists")
router.register(r"albums", album.AlbumViewSet, basename="albums")
router.register(r"play-history", play_history.PlayHistoryViewSet, basename="play_history")

urlpatterns = [path("", include(router.urls))]
