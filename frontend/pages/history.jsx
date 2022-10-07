import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistTrackState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import Songs from '../components/Songs'

function History() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    // const [countTracks, setCountTracks] = useState({});
    const [playlistTracks, setPlaylistTracks] = useRecoilState(playlistTrackState);
    const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);

    const getCountHistory = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/` + new URLSearchParams({
                // start_date: startDate,
                // end_date: endDate
            }));
            const data = await res.json();
            console.log(data)
            // setCountTracks(data);
            setPlaylistTracks(data)
        } catch (err) {
            console.log('err', err)
        }
    }
    useEffect(() => {
        getCountHistory();
    }, [])
    console.log(playlistTracks)
    return (
        <Layout>
            <div >
                <h1 className='text-white'> Count History</h1>
                <Songs songs={playlistTracks}/>
            </div>
        </Layout>
    )
}

export default History