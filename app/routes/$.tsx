import { useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "#app/components/error-boundary";
import { Link } from "#app/components/link";

export const loader = async () => {
	throw new Response("Not found", { status: 404 });
};

export default function NotFoundRoute() {
	return <ErrorBoundary />;
}

export const ErrorBoundary = () => {
	const location = useLocation();

	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-3">
							<h1>We can't find this page:</h1>
							<pre className="text-body-lg whitespace-pre-wrap break-all">
								{location.pathname}
							</pre>
						</div>
						<Link to="/" className="text-body-md underline">
							Back to home
						</Link>
					</div>
				),
			}}
		/>
	);
};
