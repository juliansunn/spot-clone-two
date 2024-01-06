import { atom } from 'recoil';

export const podcastIdState = atom({
	key: 'podcastIdState',
	default: null
});

export const podcastShowsState = atom({
	key: 'podcastItemsState',
	default: []
});

export const podcastState = atom({
	key: 'podcastState',
	default: {}
});

export const currentShowId = atom({
	key: 'currentShowId',
	default: null
});
