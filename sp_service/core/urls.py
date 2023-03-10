from django.urls import path
from rest_framework.routers import SimpleRouter
from core.views.users import UserViewSet, LoginViewSet, RegistrationViewSet, RefreshViewSet, logout

routes = SimpleRouter()

# AUTHENTICATION
routes.register(r'auth/login', LoginViewSet, basename='auth-login')
routes.register(r'auth/register', RegistrationViewSet, basename='auth-register')
routes.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')

# USER
routes.register(r'user', UserViewSet, basename='user')


urlpatterns = [
    *routes.urls,
    path("logout", logout, name="user-logout")
]