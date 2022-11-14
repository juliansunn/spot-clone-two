import React from 'react'
import { useRecoilValue } from 'recoil'
import { podcastShowsState, podcastState } from '../atoms/podcastAtom'
import Show from './Show';

function Shows() {
    const podcastShows = useRecoilValue(podcastShowsState);
    const podcast = useRecoilValue(podcastState);

    return (
        <div className='pb-28'>
            {podcastShows?.map((show, idx) => (
                <Show show={show} key={idx} />
            ))}
        </div>
    )
}
export default Shows