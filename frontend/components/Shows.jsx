import React from 'react'
import { useRecoilValue } from 'recoil'
import { podcastShowsState, podcastState } from '../atoms/podcastAtom'
import Show from './Show';

function Shows() {
    const podcastShows = useRecoilValue(podcastShowsState);
    const podcast = useRecoilValue(podcastState);
    console.log(podcast)
    console.log('podcastShows', podcastShows)
    return (
        <div className='pb-28'>
            {podcastShows?.map((show) => (
                <Show show={show} />
            ))}
        </div>
    )
}
export default Shows