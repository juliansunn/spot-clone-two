import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
    playlistIdState,
    playlistState,
    playlistTrackState
} from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import spotifyApi from '../lib/spotify';
import Playlist from './Playlist';


function Center() {

    const playlistId = useRecoilValue(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistState);
    const setTrackInfo = useSetRecoilState(trackInfoState);
    const setPlaylistTracks = useSetRecoilState(playlistTrackState);

    useEffect(() => {
        if (playlistId) {
            spotifyApi.getPlaylist(playlistId).then((data) => {
                const playlist = data.body;
                setPlaylist(playlist);
                console.log("here in center", playlistId)
                setPlaylistTracks(playlist.tracks.items);
                setTrackInfo(playlist?.tracks?.items?.map((track, i) => ({ position: i, uri: track.track.uri, id: track.track.id })))
            }).catch(error => console.log("something went wrong: ", error))
        }
    }, [playlistId])


    return (
        <Playlist playlist={playlist} />
    )
}

export default Center