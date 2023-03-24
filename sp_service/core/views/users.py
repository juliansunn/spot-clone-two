from django.contrib import auth
from rest_framework import viewsets, filters
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, permission_classes, schema
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request


from core.auth.serializers import UserSerializer
from core.models import User


class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    http_method_names = ['get']
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_joined']
    ordering = ['-date_joined']

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()

    def get_object(self):
        user_id = self.kwargs.get("pk")
        obj = get_object_or_404(User, pk=user_id)
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
    username = request.data.get("username")
    token_data = request.data.get("token_data")
    user = auth.authenticate(request, username=username, token_data=token_data, **kwargs)
    auth.login(request, user)
    return Response("You are logged in!")