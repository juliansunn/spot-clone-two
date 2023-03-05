import { useState, useEffect } from 'react';
import useSpotify from './useSpotify';
const DEFAULT_VOLUME = 50;

const useDevice = () => {
	const [myDevices, setMyDevices] = useState([]);
	const [currentDevice, setCurrentDevice] = useState(null);
	const [initialVolume, setInitialVolume] = useState(null);
	const spotifyApi = useSpotify();

	const getCurrentDevices = () => {
		spotifyApi
			.getMyDevices()
			.then((data) => {
				const devices = data.body.devices;
				const deviceToActivate = devices && devices.find((d) => d.is_active);
				setMyDevices(devices);
				spotifyApi.transferMyPlayback([deviceToActivate?.id]).then(() => {
					setCurrentDevice(deviceToActivate);
					setInitialVolume(
						deviceToActivate ? deviceToActivate?.volume_percent : DEFAULT_VOLUME
					);
				});
			})
			.catch((e) => {
				console.log('There was an error getting your devices: ', e);
			});
	};

	const activateDevice = ({ device }) => {
		spotifyApi.transferMyPlayback([device?.id]).then(() => {
			setCurrentDevice(device);
			setInitialVolume(
				deviceToActivate ? deviceToActivate?.volume_percent : DEFAULT_VOLUME
			);
		});
	};

	useEffect(() => {
		getCurrentDevices();
	}, []);

	return { myDevices, currentDevice, activateDevice, initialVolume };
};

export default useDevice;
