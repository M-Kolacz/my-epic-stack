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
import React, { useState } from "react";
import { Button } from "./components/ui/button";

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

const Document = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "light" | "dark";
}) => {
  return (
    <html lang="en" className={`${theme} h-full`}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body className="h-full flex flex-col">
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

const App = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <Document theme={theme}>
      <header className="bg-secondary p-4 flex justify-between">
        <Link to=".." relative="path">
          My Epic Stack 🚀
        </Link>

        <div>
          <Button
            variant={"outline"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Toggle theme {theme === "light" ? "🌛" : "🌞"}
          </Button>
        </div>
      </header>
      <main className="flex-1 flex justify-center items-center">
        <Outlet />
      </main>
      <footer className="bg-secondary p-4">My footer</footer>
    </Document>
  );
};

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
