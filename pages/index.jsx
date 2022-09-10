// import Head from "next/head";
// import Sidebar from "../components/Sidebar";
import Center from "../components/Center";
import { getSession } from "next-auth/react";
// import Player from "../components/Player/Player";
import Layout from "../components/Layout";


export default function Home() {
  return (
    <Layout>
      <Center />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: {
      session,
    }
  }
}
