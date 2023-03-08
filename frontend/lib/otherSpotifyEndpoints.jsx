import axios from 'axios';
export async function getDevices({ token }) {
	var config = {
		method: 'get',
		url: 'https://api.spotify.com/v1/me/player/devices',
		headers: {
			Authorization: `Bearer ${token}`
		}
	};
	const response = await axios(config);

	return response?.data?.devices;
}
