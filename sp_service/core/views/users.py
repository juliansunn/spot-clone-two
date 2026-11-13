from django.contrib import auth
from rest_framework import viewsets, filters
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, permission_classes, schema
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED, HTTP_200_OK
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from core.auth.spotify_auth import fetch_spotify_profile, user_from_profile


from core.auth.serializers import UserSerializer
from core.models import User


class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    http_method_names = ["get"]
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["date_joined"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(pk=self.request.user.pk)

    def get_object(self):
        user_id = self.kwargs.get("pk")
        obj = get_object_or_404(self.get_queryset(), pk=user_id)
        self.check_object_permissions(self.request, obj)

        return obj


@api_view()
@permission_classes((AllowAny,))
@schema(None)
def logout(request: Request, **kwargs):
    if request.user and request.user.is_authenticated:
        auth.logout(request)
    request.session.flush()
    return Response("You are logged out!")


@api_view(("POST",))
@permission_classes((AllowAny,))
def user_login(request: Request, **kwargs):
    """Session login with Spotify tokens.

    The account is derived from the verified token, never from a client-supplied
    username (which previously allowed logging in as anyone).
    """
    token_data = request.data.get("token_data") or {}
    access_token = token_data.get("access_token") if isinstance(token_data, dict) else None
    if not access_token:
        return Response(status=HTTP_401_UNAUTHORIZED, data="token_data.access_token is required.")
    profile = fetch_spotify_profile(access_token)
    if not profile:
        return Response(status=HTTP_401_UNAUTHORIZED, data="Invalid or expired Spotify token.")
    user = user_from_profile(profile, access_token, token_data.get("refresh_token"))
    auth.login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    return Response(status=HTTP_200_OK, data={"id": user.id, "email": user.email})
