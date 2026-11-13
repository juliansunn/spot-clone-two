import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useUiStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { PLAYBACK_KEY } from '@/hooks/usePlayback';
import { onWebPlayerStateChange, startWebPlayer } from '@/lib/webPlayer';

/** Starts the in-browser Spotify device once signed in and keeps playback state fresh. */
export default function WebPlayerBridge() {
	const { data: session, status } = useSession();
	const queryClient = useQueryClient();
	const webStatus = useUiStore((s) => s.webPlayer.status);
	const setWebPlayer = useUiStore((s) => s.setWebPlayer);
	const missingScope = session?.scope ? !session.scope.split(' ').includes('streaming') : false;

	useEffect(() => {
		if (status !== 'authenticated') return;
		// Sessions from before the `streaming` scope was requested can't use the SDK.
		if (missingScope) setWebPlayer({ status: 'needs-reauth', deviceId: null });
		else startWebPlayer();
	}, [status, missingScope, setWebPlayer]);

	useEffect(() => {
		if (webStatus !== 'needs-reauth') return;
		toast('Play music on this computer?', {
			id: 'web-player-reauth',
			description: 'Re-authorize Spotify once to enable the in-browser player.',
			duration: 15000,
			action: { label: 'Re-authorize', onClick: () => signIn('spotify', { callbackUrl: window.location.href }) }
		});
	}, [webStatus]);

	// The SDK pushes state changes instantly; use them to resync instead of waiting for the next poll.
	useEffect(() => {
		let timer;
		const off = onWebPlayerStateChange(() => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: PLAYBACK_KEY });
				queryClient.invalidateQueries({ queryKey: ['devices'] });
			}, 250);
		});
		return () => {
			clearTimeout(timer);
			off();
		};
	}, [queryClient]);

	return null;
}
