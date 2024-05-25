import { Link } from '#app/components/link';
import { prisma } from '#app/utils/db.server';
import { invariantResponse } from '#app/utils/invariant';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const owner = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			username: true,
			notes: true,
		},
	});

	invariantResponse(owner, 'User not found', {
		status: 404,
	});

	return json({ owner });
};

const NotesRoute = () => {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h1 className='pb-5 text-5xl'>{data.owner.username} notes 📝</h1>

			<ul className='flex flex-col gap-4'>
				{data.owner.notes.map((note) => (
					<li key={note.id}>
						<Link relative='path' to={note.id}>
							{note.title}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default NotesRoute;
