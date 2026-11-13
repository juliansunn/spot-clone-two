from django.contrib.auth.backends import ModelBackend
from core.models import User


class PasswordlessAuthBackend(ModelBackend):
    """Log in to Django without providing a password.

    """
    def authenticate(self, request, username=None, password=None, token_data=None, **kwargs):
        if password:
            return super().authenticate(request, username, password)
        # Token-based login is handled by core.auth.spotify_auth, which verifies
        # the token with Spotify. Never create/return a user from an unverified
        # username + token pair.
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

