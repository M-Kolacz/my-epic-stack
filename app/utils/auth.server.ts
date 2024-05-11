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
  const userId = authSession.get("userId");
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw await logout({ request });
  }

  return user.id;
};

export const requireAnonymous = async (request: Request) => {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
};

export const requireUserId = async (request: Request) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
};

export const requireUser = async (request: Request) => {
  const userId = await getUserId(request);

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      })
    : null;

  if (!user) {
    throw await logout({ request, redirectTo: "/login" });
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
  return verifyUserPassword({ username }, password);
};

export const signup = async ({
  email,
  name,
  username,
  password,
}: Pick<User, "email" | "username" | "name"> & { password: string }) => {
  const hash = await getPasswordHash(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      name,
      password: {
        create: {
          hash,
        },
      },
    },
    select: { id: true },
  });

  return user;
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
