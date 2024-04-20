import { LinksFunction, json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Link } from "#app/components/link";
import tailwindStyleSheetUrl from "./styles/tailwind.css?url";
import { honeypot } from "./utils/honeypot.server";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { csrf } from "./utils/csrf.server";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    {
      rel: "stylesheet",
      href: tailwindStyleSheetUrl,
    },
  ];
};

export const loader = async () => {
  const [token, cookieHeader] = await csrf.commitToken();

  const headers = new Headers();
  cookieHeader && headers.append("set-cookie", cookieHeader);

  return json(
    { honeypotInputProps: honeypot.getInputProps(), csrfToken: token },
    { headers }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col">
        <header className="bg-blue-500 p-4">
          <Link to="/">My header</Link>
        </header>
        <main className="flex-1 flex justify-center items-center">
          {children}
        </main>
        <footer className="bg-blue-300 p-4">My footer</footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { csrfToken, honeypotInputProps } = useLoaderData<typeof loader>();

  return (
    <AuthenticityTokenProvider token={csrfToken}>
      <HoneypotProvider {...honeypotInputProps}>
        <Outlet />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}
