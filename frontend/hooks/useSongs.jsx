import React from 'react';
import { useRecoilState } from 'recoil';
import { songListState } from '../atoms/songAtom';

const useSongs = () => {
	const [songs, setSongs] = useRecoilState(songListState);

	return { songs, setSongs };
};

export default useSongs;
