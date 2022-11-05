import axios from "axios";
import spotifyApi from "./spotify";



export async function getDevices({ token }) {
    var config = {
        method: 'get',
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const response = await axios(config);
    const { items } = response.data.devices;

    return response.data?.devices;

}

export async function getShows(token) {
    var config = {
        method: 'get',
        url: 'https://api.spotify.com/v1/me/shows',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await axios(config);
    const items = response.data?.items;
    return items;
}