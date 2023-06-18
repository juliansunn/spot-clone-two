from __future__ import absolute_import, unicode_literals
import json
from celery import shared_task
from app.utils.spotify_settings import SpotifyConn
from core.models import User
from django_celery_beat.models import PeriodicTask, IntervalSchedule



@shared_task(name="Add Recently Played Songs")
def add_spotify_data_to_db(**kwargs):
    user_id = kwargs.get("user_id")
    user = User.objects.filter(pk=user_id).first()
    # this really should be cached and not stored in the DB!
    token_data = kwargs.get("token_data") or get_token_data_from_user(user_id)
    conn = SpotifyConn(token=token_data, user_id=user_id)
    if valid_token_data := conn.access_token:
        if valid_token_data.get("access_token") and valid_token_data.get("refresh_token"):
            user.token_data = valid_token_data
            user.save()
    print("Adding Data to DB.")
    conn.add_data_to_db()


def get_token_data_from_user(user_id: int) -> dict:
    try:
        user: User = User.objects.get(pk=user_id)
        return user.token_data
    except User.DoesNotExist:
        return {}


@shared_task(name="Add Stream History")
def run_historical_audit_and_add_data_to_db(**kwargs):
    token = kwargs.get("token_data")
    conn = SpotifyConn(token=token)
    print("Adding Historical Data to db using the new audit functionality")
    conn.add_data_to_db(historical_data=True, **kwargs)


def schedule_spotify_data_to_db_task(user_id, **kwargs):
    kwargs_str = json.dumps({"user_id": user_id})
    schedule, _ = IntervalSchedule.objects.get_or_create(every=15, period=IntervalSchedule.MINUTES)
    task_name = f"add-spotify-data-to-db-{user_id}"
    task, _ = PeriodicTask.objects.get_or_create(
        name=task_name, 
        task="Add Recently Played Songs",
        interval=schedule,
        kwargs=kwargs_str
    )
    task.enabled = True
    task.save()
    
    print(f"Just Scheduled a New Task: {task}")
    return task 


