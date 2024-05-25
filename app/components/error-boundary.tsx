import { getErrorMessage } from '#app/utils/misc.tsx';
import { ErrorResponse } from '@remix-run/node';
import {
	isRouteErrorResponse,
	useParams,
	useRouteError,
} from '@remix-run/react';

type StatusHandler = (info: {
	error: ErrorResponse;
	params: Record<string, string | undefined>;
}) => JSX.Element | null;

export const GeneralErrorBoundary = ({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
	defaultStatusHandler?: StatusHandler;
	statusHandlers?: Record<number, StatusHandler>;
	unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) => {
	const error = useRouteError();
	const params = useParams();

	if (typeof document !== 'undefined') {
		console.error(error);
	}

	return (
		<div className='container flex items-center justify-center p-20 text-2xl'>
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedErrorHandler(error)}
		</div>
	);
};
