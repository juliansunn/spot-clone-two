import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
    playlistIdState,
    playlistState,
    playlistTrackUrisState,
    playlistTrackState
} from '../atoms/playlistAtom';
import spotifyApi from '../lib/spotify';
import Playlist from './Playlist';


function Center() {

    const playlistId = useRecoilValue(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistState);
    const setPlaylistTrackUris = useSetRecoilState(playlistTrackUrisState);
    const setPlaylistTracks = useSetRecoilState(playlistTrackState);

    useEffect(() => {

        spotifyApi.getPlaylist(playlistId).then((data) => {
            const playlist = data.body;
            setPlaylist(playlist);
            setPlaylistTracks(playlist.tracks.items);
            setPlaylistTrackUris(playlist.tracks.items.map((track) => track.track.uri))
        }).catch(error => console.log("something went wrong: ", error))
    }, [spotifyApi, playlistId])


    return (
        <Playlist playlist={playlist} />
    )
}

export default Center