import { createCookieSessionStorage } from '@remix-run/node';

export const verifySessionStorage = createCookieSessionStorage<{
	email: string;
}>({
	cookie: {
		name: 'my-epic-verify-session',
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 10, // 10 minutes
	},
});
