from django_cron import CronJobBase, Schedule
import logging
from spotify_app.utils.spotify_settings import SpotifyConn

logger = logging.getLogger(__name__)

class RecentlyPlayedSongs(CronJobBase):
    RUN_EVERY_MINS = 2
    RETRY_AFTER_FAILURE_MINS = 1
    schedule = Schedule(
        run_every_mins=RUN_EVERY_MINS,
        retry_after_failure_mins=RETRY_AFTER_FAILURE_MINS
    )
    code = 'spotify_app.recently_played_songs'

    def do(self):

        print('Starting Cron to get songs from Spotify.')
        conn = SpotifyConn()
        conn.add_data_to_db()
        print('Finished Cron to get songs from Spotify.')

def recently_played_songs():
    print('Starting Cron to get songs from Spotify.')
    conn = SpotifyConn()
    conn.add_data_to_db()
    print('Finished Cron to get songs from Spotify.')