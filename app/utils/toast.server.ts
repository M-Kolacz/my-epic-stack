import { createCookieSessionStorage, redirect } from "@remix-run/node";

export type Toast = {
	id: string;
	description: string;
	title: string;
	type: "info";
};

const toastKey = "toast";

export const toastSessionStorage = createCookieSessionStorage<
	Record<typeof toastKey, Toast>
>({
	cookie: {
		name: "my-epic-toast",
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secure: process.env.NODE_ENV === "production",
		secrets: process.env.SESSION_SECRET.split(","),
	},
});

type RedirectParameters = Parameters<typeof redirect>;

export const redirectWithToast = async (
	url: RedirectParameters[0],
	toast: Toast,
	init?: ResponseInit,
) => {
	const toastCookie = await createToastCookie(toast);

	const headers = new Headers(init?.headers);
	headers.append("set-cookie", toastCookie);

	return redirect(url, {
		headers,
		status: init?.status,
		statusText: init?.statusText,
	});
};

export const createToastCookie = async (toast: Toast) => {
	const toastSession = await toastSessionStorage.getSession();

	toastSession.flash("toast", toast);

	const toastCookie = await toastSessionStorage.commitSession(toastSession);

	return toastCookie;
};

export const getToast = async (request: Request) => {
	const cookieHeader = request.headers.get("cookie");

	const toastSession = await toastSessionStorage.getSession(cookieHeader);
	const toast = toastSession.get("toast");

	const toastCookie = await toastSessionStorage.destroySession(toastSession);

	return { toast, toastCookie };
};
