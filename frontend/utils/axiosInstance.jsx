import axios from 'axios';
import { useSession } from 'next-auth/react';

const useAxios = () => {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	const { data: session } = useSession();
	const headers = session
		? {
				'Content-Type': 'application/json',
				email: session?.user?.email,
				Authorization: `${session?.user?.accessToken}|${session.user?.refreshToken}`
		  }
		: {};
	const axiosInstance = axios.create({
		baseURL,
		headers
	});

	return { axiosInstance };
};

export default useAxios;
