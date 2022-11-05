from __future__ import absolute_import, unicode_literals
from celery import shared_task
from app.utils.spotify_settings import V2SpotifyConn


@shared_task(name="Add Recently Played Songs")
def add_spotify_data_to_db():
    conn = V2SpotifyConn()
    print("Adding Data to DB.")
    conn.add_data_to_db()


@shared_task(name="Add Stream History")
def run_historical_audit_and_add_data_to_db(**kwargs):
    conn = V2SpotifyConn()
    print("Adding Historical Data to db using the new audit functionality")
    conn.add_data_to_db(historical_data=True, **kwargs)
