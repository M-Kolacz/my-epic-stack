import { json } from "@remix-run/node";
import { prisma } from "../utils/db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  const users = await prisma.user.findMany();

  return json({ users });
};

const UserRoute = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>User Route</h1>
      <ul>
        {data.users.map((user) => {
          return <li key={user.id}>{user.email}</li>;
        })}
      </ul>
    </div>
  );
};

export default UserRoute;
