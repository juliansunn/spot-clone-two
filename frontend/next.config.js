/** @type {import('next').NextConfig} */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const dotEnvPath = path.resolve(process.cwd(), '.env');
const dotEnvExists = fs.existsSync(dotEnvPath);

let envConfig;
if (dotEnvExists) {
	envConfig = dotenv.config({
		path: dotEnvPath
	}).parsed;
} else {
	envConfig = dotenv.config({
		path: '../.env'
	}).parsed;
}

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['i.scdn.co']
	},
	env: envConfig
};

module.exports = nextConfig;
