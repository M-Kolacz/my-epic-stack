import { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Link } from "#app/components/link";
import tailwindStyleSheetUrl from "./styles/tailwind.css?url";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    {
      rel: "stylesheet",
      href: tailwindStyleSheetUrl,
    },
  ];
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
  return <Outlet />;
}
