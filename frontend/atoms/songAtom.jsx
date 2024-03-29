import { atom } from 'recoil';

export const currentTrackIdState = atom({
	key: 'currentTrackIdState',
	default: null
});

export const currentTrackTypeState = atom({
	key: 'currentTrackTypeState',
	default: 'track'
});

export const currentTrackLocState = atom({
	key: 'currentTrackLocState',
	default: 0
});

export const trackInfoState = atom({
	key: 'trackInfoState',
	default: []
});

export const isPlayingState = atom({
	key: 'isPlayingState',
	default: false
});

export const progressState = atom({
	key: 'progressState',
	default: 0
});

export const durationState = atom({
	key: 'durationState',
	default: 0
});

export const isShuffleState = atom({
	key: 'isShuffleState',
	default: false
});

export const isRepeatState = atom({
	key: 'isRepeatState',
	default: false
});

export const manualChangeState = atom({
	key: 'manualChangeState',
	default: false
});

export const songListState = atom({
	key: 'songListState',
	default: []
});

export const songQueueState = atom({
	key: 'songQueueState',
	default: []
});
