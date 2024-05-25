import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUserId } from "#app/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserId(request);

	return json({});
};

const ProfileRoute = () => {
	return (
		<div>
			<Outlet />
		</div>
	);
};
export default ProfileRoute;
