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
console.log('envConfig', envConfig);
console.log('dotEnvExists', dotEnvExists);
console.log('dotEnvPath', dotEnvPath);

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['i.scdn.co']
	},
	env: envConfig
};

module.exports = nextConfig;
