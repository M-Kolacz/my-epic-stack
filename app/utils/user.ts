import { useRouteLoaderData } from "@remix-run/react";
import { type loader as rootLoader } from "#app/root";

export const useOptionalUser = () => {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");

  return rootData?.user ?? null;
};

export const useUser = () => {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error(
      "User not found! If user is optional then use useOptionalUser instead."
    );
  }

  return maybeUser;
};
