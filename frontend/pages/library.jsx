import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistIdState, playlistsState, playlistTrackState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout'
import Songs from '../components/Songs';
import useSpotify from '../hooks/useSpotify';
import { getRandomInt } from '../lib/utility';
import PlaylistCard from '../components/PlaylistCard';
import { getShows } from '../lib/otherSpotifyEndpoints';
import PodcastCard from '../components/PodcastCard';
import { albumIdState, albumsState } from '../atoms/albumAtom';
import AlbumCard from '../components/AlbumCard';
import { artistIdState, artistsState } from '../atoms/artistAtom';
import ArtistCard from '../components/ArtistCard';

function Library() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const setPlaylistTracks = useSetRecoilState(playlistTrackState);
    // const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
    const [playlists, setPlaylists] = useRecoilState(playlistsState);
    const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
    const [albums, setAlbums] = useRecoilState(albumsState);
    const [artists, setArtists] = useRecoilState(artistsState);

    const [contentType, setContentType] = useState(0);
    // const [content, setContent] = useState(null)
    const [podcasts, setPodcasts] = useState([])
    const contentList = ["Playlists", "Podcasts", "Artists", "Albums"]

    const getArtistData = async () => {
        spotifyApi.getFollowedArtists()
            .then((data) => {

                setArtists(data.body.artists.items);
                // setPlaylistId(d.body.items[0].id);
            })
            .catch((e) => {
                console.log("Error Fetching Albums: ", e)
            });
    }

    const getAlbumData = async (offset) => {
        const albms = [];
        for (let i = 0; i < 2; ++i) {
            albms.push(spotifyApi.getMySavedAlbums({
                offset: i * offset,
            }));
        }
        Promise.all(albms)
            .then((data) => {
                const d = data[0];
                for (let j = 1; j < Math.ceil(d.body.total / offset); j++) {
                    d.body.items.push(...data[j].body.items)
                }
                setAlbums(d.body.items);
                // setPlaylistId(d.body.items[0].id);
            })
            .catch((e) => {
                console.log("Error Fetching Albums: ", e)
            });
    }

    const getPlaylistData = async (offset) => {
        const plsts = [];
        for (let i = 0; i < 2; ++i) {
            plsts.push(spotifyApi.getUserPlaylists({
                offset: i * offset,
            }));
        }

        Promise.all(plsts)
            .then((data) => {
                const d = data[0];
                for (let j = 1; j < Math.ceil(d.body.total / offset); j++) {
                    d.body.items.push(...data[j].body.items)
                }
                setPlaylists(d.body.items);
                setPlaylistId(d.body.items[0].id);
            })
            .catch((e) => {
                console.log("Error Fetching Playlists: ", e)
            });
    }


    useEffect(() => {
        if (contentType === 0) {
            getPlaylistData(20);
        } else if (contentType === 1) {
            const token = session.user.accessToken;
            getShows(token).then((d) => {
                setPodcasts(d)
            });
        } else if (contentType === 2) {
            getArtistData();
        } else if (contentType === 3) {
            getAlbumData(20);
        }
    }, [contentType,])
    console.log(artists)
    return (
        <Layout>

            <div className='px-10'>
                {/* Top */}
                <div className=' flex items-center justify-start px-20 w-full h-20 pt-20'>
                    {contentList.map((content, i) => (

                        <button
                            key={i}
                            onClick={() => { setContentType(i) }}
                            className={`hover:bg-slate-600 p-3 mx-1 rounded ${contentType == i ? "bg-slate-600" : ""} cursor-pointer`}>
                            {content}
                        </button>

                    ))}
                </div>
                <h1 className='text-lg md:text-xl xl:text-2xl text-white'>{contentList[contentType]}</h1>
                {/* Lib center */}
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4  pb-24 pt-3' >
                    {
                        contentType === 0 && playlists?.map((playlist) => (
                            <PlaylistCard key={playlist.id} data={playlist} />
                        ))
                    }
                    {
                        contentType === 1 && podcasts?.map((podcast) => (
                            <PodcastCard key={podcast.show?.id} data={podcast.show} />
                        ))
                    }
                    {
                        contentType === 2 && artists.map((artist) => (
                            <ArtistCard key={artist.id} data={artist} />
                        ))
                    }
                    {
                        contentType === 3 && albums?.map((album) => (
                            <AlbumCard key={album?.album.id} data={album?.album} />
                        ))
                    }
                </div>
            </div>

        </Layout >
    )
}

export default Library