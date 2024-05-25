import { Link } from '#app/components/link';
import { prisma } from '#app/utils/db.server';
import { json, useLoaderData } from '@remix-run/react';

export const loader = async () => {
	const users = await prisma.user.findMany({ select: { username: true } });

	return json({ users });
};

const UsersIndexRoute = () => {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h1 className='text-5xl'>Users 👥</h1>

			<ul className='flex flex-col gap-4 pt-6'>
				{data.users.map((user) => (
					<li key={user.username}>
						<Link to={user.username} relative='path'>
							👤 {user.username}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default UsersIndexRoute;
