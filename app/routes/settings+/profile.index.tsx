import { Button } from "#app/components/ui/button";
import { requireUserId } from "#app/utils/auth.server";
import { authSessionStorage } from "#app/utils/authSession.server";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { DeleteAllSessionsSchema } from "#app/utils/schema";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      sessions: { select: { createdAt: true, expirationDate: true, id: true } },
    },
  });

  invariantResponse(user, "User not found", { status: 404 });

  return json({ user });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: DeleteAllSessionsSchema,
  });

  if (submission.status !== "success") {
    return json({ lastResult: submission.reply() });
  }

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = authSession.get("sessionId");

  await prisma.session.deleteMany({
    where: { userId: userId, NOT: { id: sessionId } },
  });

  return json({ lastResult: submission.reply() });
};

const ProfileIndexRoute = () => {
  const data = useLoaderData<typeof loader>();

  const otherSessions = data.user.sessions.length - 1;

  return (
    <div>
      <div>
        <h2>🔗 Sessions</h2>
        <ul>
          {data.user.sessions.map((session) => (
            <li
              key={session.id}
              className="border-primary border-spacing-1 border-2"
            >
              <p>Session id: {session.id}</p>
              <p>Created at: {session.createdAt.toString()}</p>
              <p>Expiration date: {session.expirationDate.toString()}</p>
            </li>
          ))}
        </ul>
        {otherSessions > 0 ? <DeleteAllSessions /> : null}
      </div>
    </div>
  );
};
export default ProfileIndexRoute;

const DeleteAllSessions = () => {
  const fetcher = useFetcher<typeof action>({ key: "delete-all-sessions" });

  const [form] = useForm({
    id: "delete-all-sessions",
    lastResult: fetcher.data?.lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: DeleteAllSessionsSchema }),
  });

  return (
    <fetcher.Form method="POST" {...getFormProps(form)}>
      <Button
        type="submit"
        name="intent"
        value="delete-all-sessions"
        variant={"destructive"}
      >
        Delete other sessions
      </Button>
    </fetcher.Form>
  );
};
