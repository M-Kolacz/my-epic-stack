import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
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
import { Button } from "./components/ui/button";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ThemeSchema } from "./utils/schema";
import { getTheme, getThemeCookie, type Theme } from "./utils/theme.server";
import { Toaster } from "sonner";
import { useToast } from "./components/toaster";
import { getToast, toastSessionStorage } from "./utils/toast.server";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    {
      rel: "stylesheet",
      href: tailwindStyleSheetUrl,
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, toastHeaders } = await getToast(request);
  const headers = new Headers(toastHeaders);

  const [token, csrfCookie] = await csrf.commitToken();
  csrfCookie && headers.append("set-cookie", csrfCookie);

  const theme = getTheme(request);

  return json(
    {
      honeypotInputProps: honeypot.getInputProps(),
      csrfToken: token,
      theme,
      toast,
    } as const,
    { headers }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: ThemeSchema });

  if (submission.status !== "success") {
    return json({ lastResult: submission.reply() });
  }

  const theme = submission.value.theme;
  const themeCookie = getThemeCookie(theme);

  const headers = new Headers();
  headers.append("set-cookie", themeCookie);

  return json({ lastResult: submission.reply() }, { headers });
};

const Document = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
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

type Test = JsonifyObject;

const App = () => {
  const { toast } = useLoaderData<typeof loader>();

  const theme = useTheme();
  useToast(toast);

  return (
    <Document theme={theme}>
      <header className="bg-secondary p-4 flex justify-between">
        <Link to=".." relative="path">
          My Epic Stack 🚀
        </Link>

        <div>
          <ThemeToggle theme={theme} />
        </div>
      </header>
      <main className="flex-1 flex justify-center items-center">
        <Outlet />
      </main>
      <footer className="bg-secondary p-4">My footer</footer>
      <Toaster closeButton position="bottom-right" />
    </Document>
  );
};

const themeFetcherKey = "theme-switch";

const ThemeToggle = ({ theme }: { theme: Theme }) => {
  const fetcher = useFetcher<typeof action>({ key: themeFetcherKey });

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.lastResult,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: ThemeSchema }),
  });

  const nextMode = theme === "light" ? "dark" : "light";

  return (
    <fetcher.Form method="POST" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextMode} />
      <Button
        type="submit"
        name="intent"
        value="theme-switch"
        variant={"outline"}
      >
        Toggle theme {theme === "light" ? "🌛" : "🌞"}
      </Button>
    </fetcher.Form>
  );
};

const useTheme = () => {
  const fetcher = useFetcher<typeof action>({ key: themeFetcherKey });
  const data = useLoaderData<typeof loader>();

  if (fetcher && fetcher.formData) {
    const submission = parseWithZod(fetcher.formData, { schema: ThemeSchema });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }

  return data.theme;
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
