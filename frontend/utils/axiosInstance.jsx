import axios from 'axios';
import jwt_decode from 'jwt-decode';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

const useAxios = () => {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	const { data: session } = useSession();

	const axiosInstance = axios.create({
		baseURL,
		headers: {
			email: session?.user.email
		}
	});
	return { axiosInstance };
};

export default useAxios;
