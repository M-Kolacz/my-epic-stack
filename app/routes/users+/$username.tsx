import { Link } from "#app/components/link";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });

  invariantResponse(user, "User not found", { status: 404 });

  return json({ user });
};

const UsernameRoute = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-5xl pb-6">Hi I am {data.user.username} 👤</h1>
      <Link to="notes" relative="path">
        Check my notes 📝
      </Link>
    </div>
  );
};

export default UsernameRoute;
