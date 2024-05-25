import bcrypt from "bcryptjs";
import { authSessionStorage } from "#app/utils/authSession.server";
import { prisma } from "#app/utils/db.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import { redirect } from "@remix-run/node";
import { type User } from "@prisma/client";

/**
 * The expiration time for a session, in milliseconds.
 * By default, it is set to 30 days.
 */
export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;

export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const getUserId = async (request: Request) => {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = authSession.get("sessionId");
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId, expirationDate: { gt: new Date() } },
    select: { id: true, user: { select: { id: true } } },
  });

  if (!session) {
    throw await logout({ request });
  }

  return session.user.id;
};

export const requireAnonymous = async (request: Request) => {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
};

export const requireUserId = async (request: Request, redirectTo?: string) => {
  const userId = await getUserId(request);

  if (!userId) {
    const url = new URL(request.url);

    const searchParams = new URLSearchParams({
      redirectTo: redirectTo ? redirectTo : `${url.pathname}${url.search}`,
    });

    throw redirect(`/login?${searchParams}`);
  }

  return userId;
};

export const requireUser = async (request: Request) => {
  const userId = await requireUserId(request);

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      })
    : null;

  if (!user) {
    throw logout({ request, redirectTo: "/login" });
  }

  return user;
};

export const logout = async (
  {
    request,
    redirectTo = "/",
  }: {
    request: Request;
    redirectTo?: string;
  },
  responseInit?: ResponseInit
) => {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );

  const sessionId = authSession.get("sessionId");

  sessionId &&
    void prisma.session
      .delete({ where: { id: sessionId } })
      .catch((error) => console.error("⛓️‍💥 Unable to delete session", error));

  const headers = new Headers(responseInit?.headers);
  headers.append(
    "set-cookie",
    await authSessionStorage.destroySession(authSession)
  );

  throw redirect(safeRedirect(redirectTo), {
    headers,
    status: responseInit?.status,
    statusText: responseInit?.statusText,
  });
};

export const login = async ({
  username,
  password,
}: {
  username: User["username"];
  password: string;
}) => {
  const user = await verifyUserPassword({ username }, password);
  if (!user) return null;

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expirationDate: getSessionExpirationDate(),
    },
    select: {
      id: true,
      expirationDate: true,
    },
  });

  return session;
};

export const signup = async ({
  email,
  name,
  username,
  password,
}: Pick<User, "email" | "username" | "name"> & { password: string }) => {
  const hash = await getPasswordHash(password);

  const newSession = await prisma.session.create({
    select: {
      id: true,
      expirationDate: true,
    },
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email,
          username,
          name,
          roles: { connect: { name: "user" } },
          password: {
            create: {
              hash,
            },
          },
        },
      },
    },
  });

  return newSession;
};

export const verifyUserPassword = async (
  where: Pick<User, "id"> | Pick<User, "username">,
  password: string
) => {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword || !userWithPassword.password) return null;

  const isValidPassword = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValidPassword) return null;

  return { id: userWithPassword.id };
};

export const getPasswordHash = async (password: string) => {
  return bcrypt.hash(password, 10);
};
