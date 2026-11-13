/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined
};

module.exports = nextConfig;
