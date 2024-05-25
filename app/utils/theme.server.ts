import { parse, serialize } from "cookie";

export type Theme = "light" | "dark";

const cookieName = "my-epic-theme";
const defaultTheme = "light";

export const getTheme = (request: Request) => {
  const cookieHeader = request.headers.get("cookie");
  const parsed = cookieHeader ? parse(cookieHeader)[cookieName] : defaultTheme;

  if (parsed === "light" || parsed === "dark") return parsed;

  return defaultTheme;
};

/**
 * Serializes the theme value into a cookie string.
 *
 * @param theme - The theme value to be serialized.
 * @returns The serialized cookie string.
 */
export const getThemeCookie = (theme: Theme) =>
  serialize(cookieName, theme, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
