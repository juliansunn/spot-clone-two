import { atom, selector } from 'recoil';
import spotifyApi from '../lib/spotify';

export const currentDeviceState = atom({
	key: 'currentDeviceState',
	default: null
});

export const myDevicesState = atom({
	key: 'myDevicesState',
	default: null
});
