import React from 'react'
import { useRecoilState } from 'recoil'
import { albumState } from '../atoms/albumAtom'
import Center from '../components/Center'
import Layout from '../components/Layout'
import ListHeader from '../components/listHeader'

function Album() {
    const [album, setAlbum] = useRecoilState(albumState);
    return (

        <Layout>
            <ListHeader data={album} audioType="ALBUM" />
            <div>
                This is where songs from albums will end up going
            </div>
        </Layout>
    )
}

export default Album