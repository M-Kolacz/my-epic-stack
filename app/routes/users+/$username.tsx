import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { GeneralErrorBoundary } from "#app/components/error-boundary";
import { Link } from "#app/components/link";
import { Button } from "#app/components/ui/button";
import { prisma } from "#app/utils/db.server";
import { invariantResponse } from "#app/utils/invariant";
import { useOptionalUser } from "#app/utils/user";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const user = await prisma.user.findUnique({
		where: { username: params.username },
	});

	invariantResponse(user, "User not found", { status: 404 });

	return json({ user });
};

const UsernameRoute = () => {
	const data = useLoaderData<typeof loader>();
	const user = useOptionalUser();

	const isLoggedInUser = data.user.username === user?.username;

	return (
		<div className="flex flex-col items-start gap-4">
			<h1 className="pb-6 text-5xl">Hi I am {data.user.username} 👤</h1>
			<Link to="notes" relative="path">
				Check my notes 📝
			</Link>
			{isLoggedInUser && (
				<Form method="POST" action="/logout">
					<Button type="submit">Logout</Button>

					<AuthenticityTokenInput />
				</Form>
			)}
		</div>
	);
};
export default UsernameRoute;

export const ErrorBoundary = () => (
	<GeneralErrorBoundary
		statusHandlers={{
			404: ({ params }) => <p>User {params.username} does not exist</p>,
		}}
		unexpectedErrorHandler={() => <p>Something went wrong!</p>}
	/>
);
