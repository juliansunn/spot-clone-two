import React from 'react'
import SongTable from './SongTable';
import ListHeader from './listHeader';


function Playlist(props) {
    return (
        <div>
            <ListHeader data={props.playlist} audioType="PLAYLIST" />
            <div>
                <SongTable {...props}/>
                {/* <SongTable songs={props.playlist?.tracks?.items}/> */}
            </div>
        </div >
    )
}

export default Playlist