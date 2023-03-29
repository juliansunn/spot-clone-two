import axios from 'axios';
import jwt_decode from 'jwt-decode';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo } from 'react';

const useAxios = () => {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	const [authTokens, setAuthTokens] = useState(null);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const tokens = localStorage.getItem('authTokens');
		setAuthTokens(tokens ? JSON.parse(tokens) : null);
	}, []);

	const axiosInstance = useMemo(() => {
		const instance = axios.create({
			baseURL
		});

		instance.interceptors.request.use(async (req) => {
			if (!authTokens) {
			}
			const tokens = localStorage.getItem('authTokens')
				? JSON.parse(localStorage.getItem('authTokens'))
				: null;
			if (!tokens) {
				return req;
			}

			const user = jwt_decode(tokens?.access);
			setUser(user);
			const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

			if (!isExpired) {
				req.headers.Authorization = `Bearer ${tokens?.access}`;
				return req;
			}

			try {
				const response = await axios.post(`${baseURL}/auth/refresh/`, {
					refresh: tokens?.refresh
				});

				localStorage.setItem('authTokens', JSON.stringify(response.data));
				req.headers.Authorization = `Bearer ${response.data.access}`;
				return req;
			} catch (error) {
				console.error(error);
				return req;
			}
		});
		return { instance };
	}, [authTokens]);

	return { axiosInstance, user };
};

export default useAxios;
