import { Head, Html, Main, NextScript } from 'next/document';

// Apply the saved theme (dark by default) before first paint to avoid a flash.
const themeScript = `(function(){try{document.documentElement.classList.toggle('dark',localStorage.getItem('antefy-theme')!=='light');}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en" className="dark" suppressHydrationWarning>
			<Head>
				<meta name="theme-color" content="#09090b" />
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/icon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
