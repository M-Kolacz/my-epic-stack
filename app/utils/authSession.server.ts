import { createCookieSessionStorage } from "@remix-run/node";

export const authSessionStorage = createCookieSessionStorage<{
  userId: string;
}>({
  cookie: {
    name: "authSession",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: process.env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});
