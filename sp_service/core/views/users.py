from django.contrib import auth
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes, schema
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.auth.serializers import LoginSerializer, RegisterSerializer, UserSerializer
from core.models import User


class UserViewSet(viewsets.ModelViewSet):
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


class LoginViewSet(viewsets.ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegistrationViewSet(viewsets.ModelViewSet, TokenObtainPairView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email')
        first_name = serializer.validated_data.get("first_name")
        last_name = serializer.validated_data.get("last_name")
        user = User.objects.filter(email=email, first_name=first_name, last_name=last_name).first()
        user_status = status.HTTP_200_OK
        if not user:
            user = serializer.save()
            user_status = status.HTTP_201_CREATED
        
        refresh = RefreshToken.for_user(user)
        res = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        return Response({
            "user": serializer.data,
            "refresh": res["refresh"],
            "access": res["access"]
        }, status=user_status)



class RefreshViewSet(viewsets.ViewSet, TokenRefreshView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
@api_view()
@permission_classes((AllowAny,))
@schema(None)
def logout(request: Request, **kwargs):
    if request.user and request.user.is_authenticated:
        auth.logout(request)
    return Response()