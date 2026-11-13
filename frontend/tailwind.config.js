/** @type {import('tailwindcss').Config} */
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
	content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				bg: withAlpha('--bg'),
				surface: withAlpha('--surface'),
				elevated: withAlpha('--elevated'),
				hover: withAlpha('--hover'),
				fg: withAlpha('--fg'),
				muted: withAlpha('--muted'),
				subtle: withAlpha('--subtle'),
				line: withAlpha('--line'),
				accent: withAlpha('--accent'),
				'accent-fg': withAlpha('--accent-fg')
			},
			fontFamily: {
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
			},
			keyframes: {
				marquee: {
					'0%, 15%': { transform: 'translateX(0)' },
					'85%, 100%': { transform: 'translateX(var(--marquee-distance))' }
				},
				eq: {
					'0%, 100%': { transform: 'scaleY(0.3)' },
					'50%': { transform: 'scaleY(1)' }
				},
				shimmer: {
					'100%': { transform: 'translateX(100%)' }
				},
				'fade-in': {
					from: { opacity: 0, transform: 'translateY(4px)' },
					to: { opacity: 1, transform: 'none' }
				}
			},
			animation: {
				marquee: 'marquee 8s ease-in-out infinite alternate',
				eq: 'eq 0.9s ease-in-out infinite',
				'fade-in': 'fade-in 0.25s ease-out both'
			}
		}
	},
	plugins: []
};
