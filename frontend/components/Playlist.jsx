import React from 'react'
import Songs from './Songs';
import ListHeader from './listHeader';


function Playlist(props) {
    return (
        <div>
            <ListHeader data={props.playlist} audioType="PLAYLIST" />
            <div>
                <Songs {...props}/>
                {/* <Songs songs={props.playlist?.tracks?.items}/> */}
            </div>
        </div >
    )
}

export default Playlist