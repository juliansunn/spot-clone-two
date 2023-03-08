import { atom } from 'recoil';

export const playlistState = atom({
	key: 'playlistState',
	default: null
});

export const playlistsState = atom({
	key: 'playlistsState',
	default: []
});

export const playlistIdState = atom({
	key: 'playlistIdState',
	default: null
});
