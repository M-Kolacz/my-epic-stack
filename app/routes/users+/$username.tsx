import { Link } from "#app/components/link";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });

  invariantResponse(user !== null, "User not found", { status: 404 });

  return json({ user });
};

const UsernameRoute = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <div>Hi I am {data.user.username}</div>
      <Link to=".." relative="path">
        Go back to users
      </Link>
    </div>
  );
};

export default UsernameRoute;
