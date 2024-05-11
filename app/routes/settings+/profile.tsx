import { requireUserId } from "#app/utils/auth.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

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
