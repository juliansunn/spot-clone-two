import axios from 'axios';
import useUser from '../hooks/useUser';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use(
	(config) => {
		const { userToken } = useUser();
		if (userToken) {
			config.headers.Authorization = `Token ${userToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
