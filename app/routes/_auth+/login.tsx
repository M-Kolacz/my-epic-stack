import { Button } from "#app/components/ui/button";
import { Form, useActionData } from "@remix-run/react";
import { LoginSchema } from "#app/utils/schema";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Field, ErrorList, CheckboxField } from "#app/components/form";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { checkCsrf } from "#app/utils/csrf.server";
import { getPath } from "#app/utils/server";
import { createToastCookie } from "#app/utils/toast.server";
import { createConfettiCookie } from "#app/utils/confetti.server";
import { z } from "zod";
import { authSessionStorage } from "#app/utils/authSession.server";
import {
  getSessionExpirationDate,
  login,
  requireAnonymous,
} from "#app/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAnonymous(request);

  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAnonymous(request);

  await checkCsrf(request);
  const formData = await request.formData();
  checkHoneypot(formData, getPath(request));

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, user: null };

        const user = await login(data);

        if (!user) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, user: { id: user.id } };
      }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.user) {
    return json(
      { result: submission.reply({ hideFields: ["password"] }) },
      {
        status: submission.status === "error" ? 400 : 200,
      }
    );
  }

  const { remember, user } = submission.value;

  const headers = new Headers();

  const confettiCookie = await createConfettiCookie("login-success");
  headers.append("set-cookie", confettiCookie);

  const toastCookie = await createToastCookie({
    description: "You have successfully logged in!",
    id: "login-success",
    title: "Success!",
    type: "info",
  });
  headers.append("set-cookie", toastCookie);

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  authSession.set("userId", user.id);
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: remember ? getSessionExpirationDate() : undefined,
    })
  );

  return redirect("/users", {
    headers,
  });
};

const LoginRoute = () => {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(LoginSchema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: LoginSchema }),
    shouldValidate: "onBlur",
  });

  return (
    <Form method="POST" {...getFormProps(form)} className="flex gap-4 flex-col">
      <Field
        {...getInputProps(fields.username, { type: "text" })}
        errors={fields.username.errors}
        errorId={fields.username.errorId}
        label="Username"
        autoComplete="username"
        autoFocus
      />

      <Field
        {...getInputProps(fields.password, { type: "password" })}
        errors={fields.password.errors}
        errorId={fields.password.errorId}
        label="Password"
        autoComplete="current-password"
      />

      <CheckboxField
        {...getInputProps(fields.remember, { type: "checkbox" })}
      />

      <ErrorList errors={form.errors} errorId={form.errorId} />
      <Button type="submit">Submit</Button>

      <HoneypotInputs />
      <AuthenticityTokenInput />
    </Form>
  );
};

export default LoginRoute;
