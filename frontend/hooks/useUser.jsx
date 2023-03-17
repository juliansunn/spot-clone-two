import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const useUser = () => {
	const storage = localStorage.getItem('authTokens');
	const [apiToken, setApiToken] = useState(null);
	const [apiRefreshToken, setApiRefreshToken] = useState(null);
	const { data: session } = useSession();

	useEffect(() => {
		const getUser = async () => {
			const name = session?.user?.name.split(' ');
			const first_name = name && name[0];
			const last_name = name && name[1];
			const email = session?.user?.email;
			if (session?.user?.accessToken) {
				var config = {
					method: 'post',
					url: `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
					data: {
						first_name: first_name,
						last_name: last_name,
						email: email,
						is_active: true,
						password: process.env.DEFAULT_API_PASSWORD
					}
				};
			}

			if (storage) {
				const tokenData = JSON.parse(storage);
				console.log('tokenData', tokenData);
			} else {
				const response = await axios(config);
				if (typeof window !== 'undefined') {
					localStorage.setItem('authTokens', JSON.stringify(response?.data));
				}
				setApiToken(response?.data?.token);
				setApiRefreshToken(response?.data?.refresh);
			}
		};
		getUser();
	}, [session]);

	return { apiToken, apiRefreshToken };
};

export default useUser;
