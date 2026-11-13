"""Settings for running the test suite locally without Postgres/Redis."""
from .settings import *  # noqa: F401,F403

SECRET_KEY = "test-secret"
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
CELERY_TASK_ALWAYS_EAGER = True
# django_pdb overrides `manage.py test` with a --pdb flag that conflicts with
# Django's own, which makes the test command crash.
INSTALLED_APPS = [a for a in INSTALLED_APPS if a != "django_pdb"]  # noqa: F405
