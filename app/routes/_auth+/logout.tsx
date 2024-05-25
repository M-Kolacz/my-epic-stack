import { authSessionStorage } from '#app/utils/authSession.server';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { checkCsrf } from '#app/utils/csrf.server';

export const loader = () => {
	return redirect('/');
};

export const action = async ({ request }: ActionFunctionArgs) => {
	await checkCsrf(request);

	const authSession = await authSessionStorage.getSession();

	const headers = new Headers();
	headers.append(
		'set-cookie',
		await authSessionStorage.destroySession(authSession),
	);

	return redirect('/', { headers });
};
