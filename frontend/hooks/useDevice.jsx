import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { currentDeviceState, myDevicesState } from '../atoms/deviceAtom';
import useSpotify from './useSpotify';
const DEFAULT_VOLUME = 50;

const useDevice = () => {
	const [myDevices, setMyDevices] = useRecoilState(myDevicesState);
	const [currentDevice, setCurrentDevice] = useRecoilState(currentDeviceState);
	const [initialVolume, setInitialVolume] = useState(null);
	const spotifyApi = useSpotify();

	const getCurrentDevices = () => {
		spotifyApi
			.getMyDevices()
			.then((data) => {
				const devices = data.body.devices;
				const deviceToActivate = devices && devices.find((d) => d.is_active);
				setMyDevices(devices);
				if (!currentDevice) {
					activateDevice(deviceToActivate);
				}
			})
			.catch((e) => {
				console.log('There was an error getting your devices: ', e);
			});
	};

	const activateDevice = ({ device }) => {
		if (device) {
			spotifyApi.transferMyPlayback([device?.id]).then(() => {
				setCurrentDevice(device);
				setInitialVolume(
					deviceToActivate ? deviceToActivate?.volume_percent : DEFAULT_VOLUME
				);
			});
		}
	};

	useEffect(() => {
		getCurrentDevices();
	}, []);

	return { myDevices, currentDevice, activateDevice, initialVolume };
};

export default useDevice;
