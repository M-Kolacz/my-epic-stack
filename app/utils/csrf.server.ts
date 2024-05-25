import { CSRF, CSRFError } from 'remix-utils/csrf/server';
import { createCookie } from '@remix-run/node';
import { getPath } from '#app/utils/server';

export const csrfCookie = createCookie('csrf', {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	secrets: process.env.CSRF_SECRET.split(','),
});

export const csrf = new CSRF({
	cookie: csrfCookie,
	secret: process.env.CSRF_SIGN_SECTER,
});

export const checkCsrf = async (request: Request) => {
	try {
		await csrf.validate(request);
	} catch (error) {
		if (error instanceof CSRFError) {
			console.error(
				'👮‍♂️ CSRF attack detected',
				getPath(request),
				error.message,
			);
			throw new Response('Invalid CSRF token', { status: 403 });
		}
		throw error;
	}
};
