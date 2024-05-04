import { createCookieSessionStorage, redirect } from "@remix-run/node";

export type ConfettiId = string;

const confettiId = "confetti";

export const confettiSessionStorage = createCookieSessionStorage<
  Record<typeof confettiId, ConfettiId>
>({
  cookie: {
    name: "confetti",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    secrets: process.env.SESSION_SECRET.split(","),
  },
});

type RedirectParameters = Parameters<typeof redirect>;

export const redirectWithConfetti = async (
  url: RedirectParameters[0],
  toast: ConfettiId,
  init?: ResponseInit
) => {
  const confettiCookie = await createConfettiCookie(toast);

  const headers = new Headers(init?.headers);
  headers.append("set-cookie", confettiCookie);

  return redirect(url, {
    headers,
    status: init?.status,
    statusText: init?.statusText,
  });
};

export const createConfettiCookie = async (confetti: ConfettiId) => {
  const confettiSession = await confettiSessionStorage.getSession();

  confettiSession.flash("confetti", confetti);

  const confettiCookie =
    await confettiSessionStorage.commitSession(confettiSession);

  return confettiCookie;
};

export const getConfettiId = async (request: Request) => {
  const cookieHeader = request.headers.get("cookie");

  const confettiSession = await confettiSessionStorage.getSession(cookieHeader);
  const confettiId = confettiSession.get("confetti");

  const confettiCookie =
    await confettiSessionStorage.destroySession(confettiSession);

  return { confettiId, confettiCookie };
};
