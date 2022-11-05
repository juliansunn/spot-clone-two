import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { albumState } from '../../atoms/albumAtom'
import Layout from '../../components/Layout'
import ListHeader from '../../components/listHeader'
import useSpotify from '../../hooks/useSpotify'
import { albumIdState } from '../../atoms/albumAtom'
import {useRouter} from 'next/router'
import Songs from '../../components/Songs'

function Album() {
    const [albumId, setAlbumId] = useRecoilState(albumIdState);
    const [album, setAlbum] = useRecoilState(albumState);
    const router = useRouter();
    const pid = router.query.id;
    const spotify = useSpotify();
    
    useEffect(() => {
        spotify.getAlbum(pid).then((data) => {
            setAlbum(data.body);
            setAlbumId(pid);
        }, [album])
    })
    return (

        <Layout>
            <ListHeader data={album} audioType="ALBUM" />
            <div>
                <h1>{album?.name}</h1>
                T<Songs songs={album?.tracks?.items}/>
            </div>
        </Layout>
    )
}

export default Album
