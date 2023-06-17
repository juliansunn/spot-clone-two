import axios from 'axios';
import { useSession } from 'next-auth/react';

const useAxios = () => {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	const { data: session } = useSession();

	const axiosInstance = axios.create({
		baseURL,
		headers: {
			email: session?.user.email,
			expires_at: session?.expires,
			access_token: session?.user.accessToken,
			refresh_token: session?.user.refreshToken,
			token_type: 'Bearer'
		}
	});
	return { axiosInstance };
};

export default useAxios;
