import { Link } from "#app/components/link";
import { prisma } from "#app/utils/db.server";
import { json, useLoaderData } from "@remix-run/react";

export const loader = async () => {
  const users = await prisma.user.findMany({ select: { username: true } });

  return json({ users });
};

const UsersIndexRoute = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <ul className="flex flex-col gap-4">
      {data.users.map((user) => (
        <li key={user.username}>
          <Link to={user.username} relative="path">
            Go to {user.username}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UsersIndexRoute;
