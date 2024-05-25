import { GeneralErrorBoundary } from '#app/components/error-boundary';
import { requireUserWithRole } from '#app/utils/permissions.server';
import { LoaderFunctionArgs, json } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserWithRole(request, 'admin');

	return json({});
};

const AdminRoute = () => {
	return <div>Admin Route</div>;
};
export default AdminRoute;

export const ErrorBoundary = () => (
	<GeneralErrorBoundary
		defaultStatusHandler={({ error }) => (
			<p>
				{error.status} {error.data}
			</p>
		)}
		unexpectedErrorHandler={(error) => <p>OH NO</p>}
		statusHandlers={{ 403: () => <p>Forbidden</p> }}
	/>
);
