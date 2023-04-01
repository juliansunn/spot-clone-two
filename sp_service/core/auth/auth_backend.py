from django.contrib.auth.backends import ModelBackend
from core.models import User
from app.utils.spotify_settings import SpotifyConn


class PasswordlessAuthBackend(ModelBackend):
    """Log in to Django without providing a password.

    """
    def authenticate(self, request, username=None, password=None, token_data=None, **kwargs):
        if password:
            return super().authenticate(request, username, password)
        if token_data:
            conn = SpotifyConn(token=token_data)
            if valid_token_data := conn.access_token:
                if valid_token_data.get("access_token") and valid_token_data.get("refresh_token"):
                    user, _ = User.objects.get_or_create(email=username)
                    user.token_data = token_data
                    user.save()
                    return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

