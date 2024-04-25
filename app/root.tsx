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
import { GeneralErrorBoundary } from "./components/error-boundary";
import React from "react";

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

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState("dark");

  return (
    <html lang="en" className={`${theme} h-full`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col">
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle theme
        </button>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App = () => (
  <>
    <header className="bg-secondary p-4">
      <Link to=".." relative="path">
        My header
      </Link>
    </header>
    <main className="flex-1 flex justify-center items-center">
      <Outlet />
    </main>
    <footer className="bg-secondary p-4">My footer</footer>
  </>
);

export default function AppWithProviders() {
  const { csrfToken, honeypotInputProps } = useLoaderData<typeof loader>();

  return (
    <AuthenticityTokenProvider token={csrfToken}>
      <HoneypotProvider {...honeypotInputProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}

export const ErrorBoundary = () => (
  <GeneralErrorBoundary
    defaultStatusHandler={({ error }) => (
      <p>
        {error.status} {error.data}
      </p>
    )}
    unexpectedErrorHandler={(error) => <p>OH NO</p>}
  />
);
