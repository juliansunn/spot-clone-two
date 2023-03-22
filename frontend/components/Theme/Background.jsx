import React from 'react';

const Background = ({ children }) => {
	return (
		<body className="bg-zinc-200 bg- dark:bg-zinc-900 transition-all">
			{children}
		</body>
	);
};

export default Background;
