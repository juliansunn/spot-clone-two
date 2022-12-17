import Center from '../components/Center';
import { getSession } from 'next-auth/react';
import Layout from '../components/Layout';

export default function Home() {
	return (
		<Layout>
			<div>HOME</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession(context);
	return {
		props: {
			session
		}
	};
}
