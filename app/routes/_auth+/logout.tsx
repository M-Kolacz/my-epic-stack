import { authSessionStorage } from "#app/utils/authSession.server";
import { redirect } from "@remix-run/node";

export const loader = () => {
  return redirect("/");
};

export const action = async () => {
  const authSession = await authSessionStorage.getSession();

  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.destroySession(authSession)
  );

  return redirect("/", { headers });
};
