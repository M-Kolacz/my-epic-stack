import { createCookieSessionStorage } from '@remix-run/node';

export const authSessionStorage = createCookieSessionStorage<{
	sessionId: string;
}>({
	cookie: {
		name: 'my-epic-auth-session',
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
});
