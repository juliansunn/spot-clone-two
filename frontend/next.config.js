/** @type {import('next').NextConfig} */
const { parsed: localEnv } = require('dotenv').config({
	path: '../.env'
});
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['i.scdn.co']
	},
	env: localEnv
};

module.exports = nextConfig;
