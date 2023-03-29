import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { currentDeviceState, myDevicesState } from '../atoms/deviceAtom';
import useSpotify from './useSpotify';
const DEFAULT_VOLUME = 50;

const useDevice = () => {
	const spotifyApi = useSpotify();
	const { data: session } = useSession();
	const [myDevices, setMyDevices] = useRecoilState(myDevicesState);
	const [currentDevice, setCurrentDevice] = useRecoilState(currentDeviceState);
	const [initialVolume, setInitialVolume] = useState(null);
	const getCurrentDevices = async () => {
		const data = await spotifyApi.getMyDevices();
		const devices = data?.body?.devices;
		const deviceToActivate = devices && devices.find((d) => d.is_active);
		if (!currentDevice) {
			activateDevice(deviceToActivate);
		}
		if (devices) {
			setMyDevices(devices);
			setInitialVolume(currentDevice?.volume_percent);
		}
	};

	const activateDevice = ({ device }) => {
		if (device) {
			spotifyApi.transferMyPlayback([device?.id]).then(() => {
				setCurrentDevice(device);
				setInitialVolume(device ? device?.volume_percent : DEFAULT_VOLUME);
			});
		}
	};

	useEffect(() => {
		getCurrentDevices();
	}, [currentDevice, session]);

	return { myDevices, currentDevice, activateDevice, initialVolume };
};

export default useDevice;
