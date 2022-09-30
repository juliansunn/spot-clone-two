import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';

function History() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [countTracks, setCountTracks] = useState({});

    const getCountHistory = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/` + new URLSearchParams({
                // start_date: startDate,
                // end_date: endDate
            }));
            const data = await res.json();
            console.log('data', data)
            setCountTracks(data);
        } catch (err) {
            console.log('err', err)
        }
    }
    useEffect(() => {
        getCountHistory();
    }, [startDate, endDate])

    return (
        <Layout>
            <div >
                <h1 className='text-white'> Count History</h1>

            </div>
        </Layout>
    )
}

export default History