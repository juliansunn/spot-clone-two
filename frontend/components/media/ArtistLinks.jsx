import { Fragment } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function ArtistLinks({ artists, className, onClick }) {
	if (!artists?.length) return null;
	return (
		<span className={cn('truncate', className)}>
			{artists.map((a, i) => (
				<Fragment key={a.id ?? a.name ?? i}>
					{i > 0 && ', '}
					{a.id ? (
						<Link href={`/artist/${a.id}`} className="link-hover" onClick={onClick}>
							{a.name}
						</Link>
					) : (
						a.name
					)}
				</Fragment>
			))}
		</span>
	);
}
