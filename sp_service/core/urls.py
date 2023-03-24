from django.urls import path
from rest_framework.routers import SimpleRouter
from core.views.users import UserViewSet, logout, user_login

routes = SimpleRouter()


# USER
routes.register(r'user', UserViewSet, basename='user')


urlpatterns = [
    *routes.urls,
    path("logout", logout, name="user-logout"),
    path("login", user_login, name="user-login")
]