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
        from pprint import pprint

        if authorization := request.headers.get("Authorization"):
            access_token, refresh_token = authorization.split("|")
            if email := request.headers.get("email"):
                user = get_user_from_spotify_session(email, access_token, refresh_token)
                if user:
                    # Assign the user object to the request for further use in the view
                    request.user = user
                    return True
            return False


def get_user_from_spotify_session(email, access_token, refresh_token):
    # Add your logic to retrieve the user based on the session token
    # You can query your database or external service to get the user
    # Return the user object if found, None otherwise

    user, created = User.objects.update_or_create(
        email=email,
        defaults={
            "token_data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        },
    )

    if created:
        logger.info(f"User created for email: {user.email}")
        task = schedule_spotify_data_to_db_task(user_id=user.pk)
        task.enabled = True
        task.save()
    return user


class PaginatedAuthMixin(viewsets.ReadOnlyModelViewSet):
    permission_classes = (SpotifySessionPermission,)
    pagination_class = StandardResultsSetPagination

    def get_user(self):
        user_id = self.request.user.pk
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
