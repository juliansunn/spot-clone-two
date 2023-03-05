import { useRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackLocState,
	trackInfoState
} from '../atoms/songAtom';

const useTrackInfo = () => {
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
	const [currentTrackLoc, setCurrentTrackLoc] =
		useRecoilState(currentTrackLocState);
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	return {
		trackInfo,
		setTrackInfo,
		currentTrackLoc,
		setCurrentTrackLoc,
		currentTrackId,
		setCurrentTrackId
	};
};

export default useTrackInfo;
