import pytz
from django.utils import timezone


def create_track(track):
    from spotify_app.models import (Track, PlayHistory)
    album = create_album(track.album)
    db_track, created = Track.objects.get_or_create(
        name=track.name,
        href=track.href,
        spotify_id=track.spotify_id,
        uri=track.uri,
        disc_number=track.disc_number,
        duration=track.duration_ms,
        popularity=track.popularity,
        preview_url=track.preview_url,
        track_number=track.track_number,
        album=album)
    track_artists = [create_artist(t) for t in track.artists]
    for ta in track_artists:
        db_track.artist_tracks.add(ta)
    PlayHistory.objects.get_or_create(played_at=track.played_at, track=db_track)
    album.album_tracks.add(db_track)
    return db_track, created

def create_album(album):
    from spotify_app.models import Album
    album_artists = [create_artist(a) for a in album.artists]
    release_date = album.release_date
    if '-' not in release_date:
        release_date = f"{release_date}-01-01"
    album_db = Album.objects.get_or_create(
        name=album.name,
        href=album.href,
        spotify_id=album.spotify_id,
        uri=album.uri,
        release_date=release_date,
        total_tracks=album.total_tracks,
        )[0]
    for i in album.images:
        create_image(i, album_db)

    for artist in album_artists:
        album_db.artists.add(artist)
    return album_db

def create_image(image, album):
    from spotify_app.models import Image
    return Image.objects.get_or_create(
        height=image.height,
        width=image.width,
        url=image.url,
        album=album,
    )[0]

def create_artist(data):
    from spotify_app.models import Artist
    return Artist.objects.get_or_create(
        name=data.name,
        href=data.href,
        spotify_id=data.spotify_id,
        uri=data.uri
        )[0]

def convert_to_local_time(utctime):
    utc = utctime.replace(tzinfo=pytz.UTC)
    return utc.astimezone(timezone.get_current_timezone())
