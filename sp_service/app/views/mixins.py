import json
import logging
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import viewsets
from app.tasks import schedule_spotify_data_to_db_task
from core.models import User


logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response(
            {
                "links": {
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
                "user": self.request.user.id,
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "type": "history",
                "results": data,
            }
        )


class SpotifySessionPermission(BasePermission):
    def has_permission(self, request, *args, **kwargs):
        if token_str := request.headers.get("Spotify-Session-Token"):
            session_token = json.loads(token_str)
            user = get_user_from_spotify_session(session_token)
            if user:
                # Assign the user object to the request for further use in the view
                request.user = user
                return True
        return False


def get_user_from_spotify_session(session_token):
    # Add your logic to retrieve the user based on the session token
    # You can query your database or external service to get the user
    # Return the user object if found, None otherwise
    email = session_token.get("email")
    if email:
        user, created = User.objects.get_or_create(email=email)
        if created:
            logger.info(f"User created for email: {user.email}")
            task = schedule_spotify_data_to_db_task(user_id=user.pk)
            task.enabled = True
            task.save()
        return user
    return None


class PaginatedAuthMixin(viewsets.ReadOnlyModelViewSet):
    permission_classes = (SpotifySessionPermission,)
    pagination_class = StandardResultsSetPagination

    def get_user(self):
        user_id = self.request.user.pk
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
