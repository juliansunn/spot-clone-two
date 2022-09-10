import { useSession } from "next-auth/react";
import Layout from "../components/Layout";
import useSpotify from "../hooks/useSpotify";

function Episodes() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    return (
        <Layout>
            <div>Episodes</div>
        </Layout>
    )
}

export default Episodes