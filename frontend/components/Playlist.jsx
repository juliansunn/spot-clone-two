import React from 'react'
import Songs from './Songs';
import ListHeader from './listHeader';


function Playlist({ playlist }) {

    return (
        <div>
            <ListHeader data={playlist} audioType="PLAYLIST" />
            <div>
                <Songs songs={playlist?.tracks?.items}/>
            </div>
        </div >
    )
}

export default Playlist