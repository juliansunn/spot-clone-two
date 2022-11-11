import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { albumState } from '../../atoms/albumAtom'
import Layout from '../../components/Layout'
import ListHeader from '../../components/listHeader'
import useSpotify from '../../hooks/useSpotify'
import { albumIdState } from '../../atoms/albumAtom'
import {useRouter} from 'next/router'
import Songs from '../../components/Songs'
import { playlistIdState } from '../../atoms/playlistAtom'

function Album() {
    const [albumId, setAlbumId] = useRecoilState(albumIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistIdState);
    const [album, setAlbum] = useRecoilState(albumState);
    const router = useRouter();
    const pid = router.query.id;
    const spotify = useSpotify();
    
    useEffect(() => {
        spotify.getAlbum(pid).then((data) => {
            setPlaylist(data.body);
            setAlbum(data.body);
            setAlbumId(pid);
        }, [])
    })
    return (

        <Layout>
            <ListHeader data={playlist} audioType="ALBUM" />
            <div>
                <Songs songs={album} type="album"/>
            </div>
        </Layout>
    )
}

export default Album
