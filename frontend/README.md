# Antefy frontend

Next.js 16 (pages router) client for browsing your Spotify library and controlling playback.

## Setup

1. Create an app at <https://developer.spotify.com/dashboard> and add this redirect URI:
   `http://127.0.0.1:3000/api/auth/callback/spotify`
   (Spotify no longer accepts `localhost`; use `127.0.0.1` in the browser too.)
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and
   `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
3. `npm install && npm run dev`, then open <http://127.0.0.1:3000>.

Requires Node 20.9+. Spotify Development Mode apps need the app owner to have Premium, and other
accounts must be added under *User Management* in the dashboard.

Playback control needs Spotify Premium and an open Spotify app (phone, desktop or speaker). Pick it
from the device menu in the player bar.

## Architecture

| Area | Where |
| --- | --- |
| Auth (NextAuth + Spotify, token refresh) | `lib/auth.js`, `pages/api/auth/[...nextauth].js` |
| Route protection | `proxy.js` (rewrites signed-out requests to `/login`) |
| Spotify Web API client | `lib/spotify.js`: fetch wrapper with 401 refresh, 429 retry, and fallbacks for the Feb 2026 API changes |
| Server state | `@tanstack/react-query` hooks in `hooks/` |
| Playback | `hooks/usePlayback.js`: polls `/me/player`, interpolates progress, optimistic controls |
| UI state | `lib/store.js` (zustand) |

## Scripts

- `npm run dev`: dev server
- `npm run lint`: ESLint (zero warnings allowed)
- `npm run build && npm start`: production build

## Keyboard shortcuts

- `Space`: play / pause
- `/`: focus search
