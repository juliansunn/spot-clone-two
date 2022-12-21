import { atom } from 'recoil';

const date = new Date();
date.setDate(date.getDate() - 7);

export const searchQueryState = atom({
	key: 'searchQueryState',
	default: []
});

export const startDateState = atom({
	key: 'startDateState',
	default: date
});

export const endDateState = atom({
	key: 'endDateState',
	default: new Date()
});
