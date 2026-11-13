"""Authenticate API requests with a Spotify access token.

The previous implementation trusted an ``email`` request header and stored
whatever tokens accompanied it, so anyone could impersonate any user (and
overwrite their stored tokens). Here the token is verified against Spotify's
``/me`` endpoint and the user is derived from Spotify's answer.
"""
import hashlib
import logging

import requests
from django.core.cache import cache
from rest_framework import authentication, exceptions

from core.models import User

logger = logging.getLogger(__name__)

SPOTIFY_ME_URL = "https://api.spotify.com/v1/me"
PROFILE_CACHE_SECONDS = 300
KEYWORD = "Spotify"


def fetch_spotify_profile(access_token: str):
    """Return the Spotify profile for a token, or None if the token is invalid."""
    cache_key = "spotify-profile:" + hashlib.sha256(access_token.encode()).hexdigest()
    profile = cache.get(cache_key)
    if profile is not None:
        return profile
    try:
        res = requests.get(
            SPOTIFY_ME_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=5,
        )
    except requests.RequestException as e:
        logger.warning("Could not reach Spotify to verify token: %s", e)
        raise exceptions.AuthenticationFailed("Could not verify Spotify token.")
    if res.status_code != 200:
        return None
    profile = res.json()
    if not profile.get("id"):
        return None
    cache.set(cache_key, profile, PROFILE_CACHE_SECONDS)
    return profile


def user_from_profile(profile: dict, access_token: str, refresh_token: str = None):
    """Find or create the local user for a verified Spotify profile."""
    spotify_id = profile["id"]
    # Spotify stopped returning email for Development Mode apps in 2026.
    email = profile.get("email") or f"{spotify_id}@users.spotify.invalid"

    user = User.objects.filter(spotify_id=spotify_id).first()
    if user is None:
        user = User.objects.filter(email__iexact=email).first()
    created = user is None
    if created:
        user = User(email=email)

    user.spotify_id = spotify_id
    name = (profile.get("display_name") or "").split(" ", 1)
    if not user.first_name and name[0]:
        user.first_name = name[0][:30]
    token_data = dict(user.token_data or {})
    token_data["access_token"] = access_token
    if refresh_token:
        token_data["refresh_token"] = refresh_token
    user.token_data = token_data
    if created:
        user.set_unusable_password()
    user.save()

    if created or refresh_token:
        # Imported lazily: tasks imports models that import this module's app.
        from app.tasks import schedule_spotify_data_to_db_task

        schedule_spotify_data_to_db_task(user_id=user.pk)
    return user


class SpotifyTokenAuthentication(authentication.BaseAuthentication):
    """``Authorization: Spotify <access token>`` (+ optional ``X-Spotify-Refresh-Token``)."""

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        parts = header.split(" ", 1)
        if len(parts) != 2 or parts[0] != KEYWORD or not parts[1].strip():
            return None
        access_token = parts[1].strip()
        profile = fetch_spotify_profile(access_token)
        if profile is None:
            raise exceptions.AuthenticationFailed("Invalid or expired Spotify token.")
        refresh_token = request.headers.get("X-Spotify-Refresh-Token") or None
        user = user_from_profile(profile, access_token, refresh_token)
        return user, access_token

    def authenticate_header(self, request):
        return KEYWORD
