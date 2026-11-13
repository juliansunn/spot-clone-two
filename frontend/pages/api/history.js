import { getToken } from 'next-auth/jwt';

/**
 * Server-side proxy to the Django play-history service.
 * Spotify tokens never leave the server: the browser only talks to this route,
 * and Django verifies the access token with Spotify before trusting it.
 */
const API_URL = process.env.SP_API_URL || process.env.NEXT_PUBLIC_API_URL;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	if (!token?.accessToken || token.error) return res.status(401).json({ error: 'Not signed in' });

	if (!API_URL) {
		return res.status(503).json({ error: 'History service is not configured (set SP_API_URL).', code: 'NOT_CONFIGURED' });
	}

	const { page = '1', start_date, end_date } = req.query;
	const params = new URLSearchParams({ page: String(Math.max(1, parseInt(page, 10) || 1)) });
	if (typeof start_date === 'string' && DATE_RE.test(start_date)) params.set('start_date', start_date);
	if (typeof end_date === 'string' && DATE_RE.test(end_date)) params.set('end_date', end_date);

	try {
		const upstream = await fetch(`${API_URL.replace(/\/$/, '')}/play-history/?${params}`, {
			headers: {
				Accept: 'application/json',
				Authorization: `Spotify ${token.accessToken}`,
				'X-Spotify-Refresh-Token': token.refreshToken ?? ''
			},
			signal: AbortSignal.timeout(10000)
		});
		const body = await upstream.json().catch(() => ({}));
		if (!upstream.ok) {
			return res.status(upstream.status).json({ error: body?.detail || 'History service error' });
		}
		res.setHeader('Cache-Control', 'private, no-store');
		return res.status(200).json(body);
	} catch (e) {
		return res.status(503).json({ error: 'History service is unreachable. Is the backend running?', code: 'UNREACHABLE' });
	}
}
