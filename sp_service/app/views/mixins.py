# from app.pagination import StandardResultsSetPagination
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework import viewsets
from core.models import User



class StandardResultsSetPagination(PageNumberPagination):
    
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            "user": self.request.user.id,
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            "type": "history",
            'results': data
        })
class PaginatedAuthMixin(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = (IsAuthenticated,)
    pagination_class = StandardResultsSetPagination

    def get_user(self):
        user_id = self.request.session.get("_auth_user_id")
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None