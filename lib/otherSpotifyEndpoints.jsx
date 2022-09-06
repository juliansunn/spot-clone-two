import axios from "axios";
import { useSession } from "next-auth/react";
import spotifyApi from "./spotify";



export default async function getDevices({ token }) {
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