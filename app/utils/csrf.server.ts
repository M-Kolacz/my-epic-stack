import { CSRF, CSRFError } from "remix-utils/csrf/server";
import { createCookie } from "@remix-run/node";
import { getPath } from "#app/utils/server";

export const csrfCookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: ["secret1", "secret2"],
});

export const csrf = new CSRF({
  cookie: csrfCookie,
  secret: "another-secret",
});

export const checkCsrf = async (request: Request) => {
  try {
    await csrf.validate(request);
  } catch (error) {
    if (error instanceof CSRFError) {
      console.warn("👮‍♂️ CSRF attack detected", getPath(request), error.message);
      throw new Response("Form not submitted properly", { status: 400 });
    }
    throw error;
  }
};
