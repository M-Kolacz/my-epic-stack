import { type LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../../utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    // if we can connect to the database and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    await Promise.all([
      prisma.user.count(),
      fetch(`${new URL(request.url).protocol}${host}`, {
        method: "HEAD",
        headers: { "X-Healthcheck": "true" },
      }).then((response) => {
        if (!response.ok) return Promise.reject(response);
      }),
    ]);
    return new Response("OK");
  } catch (error) {
    console.log("Healthcheck ❌", { error });
    throw new Response("ERROR", { status: 500 });
  }
};
