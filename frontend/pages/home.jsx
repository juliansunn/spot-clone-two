import { useSession } from "next-auth/react";
import Layout from "../components/Layout";
import useSpotify from "../hooks/useSpotify";

function Home() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    return (
        <Layout>
            <div>Home</div>
        </Layout>
    )
}

export default Home