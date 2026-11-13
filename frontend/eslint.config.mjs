import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
	...nextVitals,
	{
		rules: {
			// Spotify serves pre-sized images; Next's optimizer isn't needed.
			'@next/next/no-img-element': 'off'
		}
	},
	{ ignores: ['.next/**', 'node_modules/**', 'out/**'] }
];

export default config;
