import { requireUserId } from "#app/utils/auth.server";
import { prisma } from "#app/utils/db.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      password: false,
      _count: false,
      notes: true,
      roles: true,
      sessions: true,
    },
  });

  return json(userData);
};
