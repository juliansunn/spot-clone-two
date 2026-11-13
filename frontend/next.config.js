/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Next only reads .env files from the project dir. In this repo the shared
// .env lives at the repo root (also used by docker-compose), so load it into
// process.env for the server. Nothing is forwarded to the client bundle except
// variables prefixed with NEXT_PUBLIC_ (Next's default behaviour).
const rootEnv = path.resolve(__dirname, '..', '.env');
if (!fs.existsSync(path.resolve(__dirname, '.env')) && fs.existsSync(rootEnv)) {
	require('dotenv').config({ path: rootEnv });
}

const nextConfig = {
	reactStrictMode: true,
	output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'i.scdn.co' },
			{ protocol: 'https', hostname: '*.scdn.co' },
			{ protocol: 'https', hostname: '*.spotifycdn.com' },
			{ protocol: 'https', hostname: '*.fbcdn.net' },
			{ protocol: 'https', hostname: '*.fbsbx.com' },
			{ protocol: 'https', hostname: '*.googleusercontent.com' }
		]
	},
	poweredByHeader: false
};

module.exports = nextConfig;
