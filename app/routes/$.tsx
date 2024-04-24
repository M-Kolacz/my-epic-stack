import { GeneralErrorBoundary } from "#app/components/error-boundary";
import { Link } from "#app/components/link";
import { useLocation } from "@remix-run/react";

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
              <pre className="whitespace-pre-wrap break-all text-body-lg">
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
