import React from 'react'
import Songs from './Songs';
import ListHeader from './listHeader';


function Playlist({ playlist }) {

    return (
        <div>
            <ListHeader data={playlist} audioType="PLAYLIST" />
            <div>
                <Songs />
            </div>
        </div >
    )
}

export default Playlist