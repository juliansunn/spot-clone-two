from __future__ import absolute_import, unicode_literals
from celery import shared_task, current_app
from celery.schedules import crontab
from app.utils.spotify_settings import SpotifyConn


@shared_task(name="Add Recently Played Songs")
def add_spotify_data_to_db(**kwargs):
    token_data = kwargs.get("token_data")
    conn = SpotifyConn(token=token_data)
    print("Adding Data to DB.")
    conn.add_data_to_db()


@shared_task(name="Add Stream History")
def run_historical_audit_and_add_data_to_db(**kwargs):
    token = kwargs.get("token_data")
    conn = SpotifyConn(token=token)
    print("Adding Historical Data to db using the new audit functionality")
    conn.add_data_to_db(historical_data=True, **kwargs)


def schedule_spotify_data_to_db_task(user, token_data,  *args, **kwargs):


    # Call the task manually to run immediately after user logs in
    add_spotify_data_to_db.apply_async(
        kwargs={'token_data': token_data}
    )
    # Schedule the task to run every 15 minutes
    current_app.conf.beat_schedule[f"audit_task_{user['id']}"] = {
        'task': 'yourapp.tasks.run_historical_audit_and_add_data_to_db',
        'schedule': crontab(minute='*/15'),
        'kwargs': {'token_data': token_data,},
    }
    current_app.conf.timezone = 'UTC'
    # Save the schedule to the database
    current_app.conf.beat_schedule_filename = 'celerybeat-schedule'
    current_app.conf.beat_schedule_changed = True

