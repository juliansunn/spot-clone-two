from this import d
import pytz
from datetime import datetime

class Search:
    def __init__(self, data):
        self.data = data

    def __setattr__(self, __name: str, __value) -> None:
        self.__dict__[__name] = __value

    @property
    def name(self):
        return self.data.get('name')

    @property
    def href(self):
        return self.data.get('href')

    @property
    def spotify_id(self):
        return self.data.get('id')

    @property
    def uri(self):
        return self.data.get('uri')

class Parser:
    def __init__(self, response):
        self.response = response

    @property
    def items(self):
        return self.response.get('items', [])

    @property
    def next(self):
        return self.response.get('next')

    @property
    def cursors(self):
        return self.response.get('cursors')

    @property
    def before(self):
        return self.cursors.get('before')

    @property
    def after(self):
        return self.cursors.get('after')

    @property
    def limit(self):
        return self.response.get('limit')

    @property
    def track_list(self):
        return [ParsedTrack(t) for t in self.items]

class ParsedTrack(Search):
    def __init__(self, data, played_at=None):
        self.data = data.get('track', data)
        self.played_at = data.get('played_at', self._parse_date(played_at))

    def _parse_date(self, date):
        if not date:
            return None
        naive = datetime.strptime(date, "%Y-%m-%d %H:%M")
        return naive.astimezone(pytz.utc)

    @property
    def album(self):
        return Album(data=self.data.get('album'))

    @property
    def artists(self):
        return [Artist(a) for a in self.data.get('artists', [])]

    @property
    def context(self):
        return self.data.get('context')

    @property
    def disc_number(self):
        return self.data.get('disc_number')

    @property
    def duration_ms(self):
        return self.data.get('duration_ms')

    @property
    def popularity(self):
        return self.data.get('popularity')

    @property
    def preview_url(self):
        return self.data.get('preview_url')

    @property
    def track_number(self):
        return self.data.get('track_number')


class Artist(Search):
    def __init__(self, data):
        self.data = data.get('data', data)

class Image:
    def __init__(self, data):
        self.data = data

    @property
    def height(self):
        return self.data.get('height')

    @property
    def width(self):
        return self.data.get('width')

    @property
    def url(self):
        return self.data.get('url')

class Album(Search):
    def __init__(self, data):
        self.data = data
    @property
    def release_date(self):
        return self.data.get('release_date')

    @property
    def artists(self):
        return [Artist(a) for a in self.data.get('artists', [])]

    @property
    def images(self):
        return [Image(i) for i in self.data.get('images', [])]

    @property
    def total_tracks(self):
        return self.data.get('total_tracks')

