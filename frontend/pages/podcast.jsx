import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil';
import { podcastIdState, podcastShowsState, podcastState } from '../atoms/podcastAtom'
import Layout from '../components/Layout'
import ListHeader from '../components/listHeader';
import Shows from '../components/Shows';
import useSpotify from '../hooks/useSpotify';

function Podcast() {
    const spotifyApi = useSpotify();
    const [podcastId, setPodcastId] = useRecoilState(podcastIdState);
    const [podcastShows, setPodcastShows] = useRecoilState(podcastShowsState)
    const [podcast, setPodcast] = useRecoilState(podcastState);

    useEffect(() => {
        if (podcastId) {
            spotifyApi.getShowEpisodes(podcastId).then((data) => {
                console.log(data);
                setPodcastShows(data.body.items);
            });
        }
    }, [podcastId])

    return (
        <Layout>
            <ListHeader data={podcast} audioType="PODCAST" />
            <div>
                <Shows />
            </div>
        </Layout>
    )
}

export default Podcast