import { Link } from "#app/components/link";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const owner = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      username: true,
      notes: true,
    },
  });

  invariantResponse(owner !== null, "User not found", {
    status: 404,
  });

  return json({ owner });
};

const NotesRoute = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <div>{data.owner.username} notes</div>

      <ul>
        {data.owner.notes.map((note) => (
          <li key={note.id}>{note.title}</li>
        ))}
      </ul>
      <Link to=".." relative="path">
        Go back to users
      </Link>
    </div>
  );
};

export default NotesRoute;
