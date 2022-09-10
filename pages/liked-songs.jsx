import { useSession } from "next-auth/react";
import Layout from "../components/Layout";
import useSpotify from "../hooks/useSpotify";

function LikedSongs() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    return (
        <Layout>
            <div>LikedSongs</div>
        </Layout>
    )
}

export default LikedSongs