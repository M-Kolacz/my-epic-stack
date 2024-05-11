import { Form, useActionData } from "@remix-run/react";
import { Field, ErrorList, CheckboxField } from "#app/components/form";
import { Button } from "#app/components/ui/button";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { SignupSchema } from "#app/utils/schema";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { checkCsrf } from "#app/utils/csrf.server";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { getPath } from "#app/utils/server";
import { prisma } from "#app/utils/db.server";
import {
  getSessionExpirationDate,
  requireAnonymous,
  signup,
} from "#app/utils/auth.server";
import { createConfettiCookie } from "#app/utils/confetti.server";
import { createToastCookie } from "#app/utils/toast.server";
import { authSessionStorage } from "#app/utils/authSession.server";

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
      SignupSchema.superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findMany({
          where: { OR: [{ email: data.email }, { username: data.username }] },
          select: { id: true, email: true, username: true },
        });

        existingUser.forEach((user) => {
          user.email === data.email &&
            ctx.addIssue({
              code: "custom",
              path: ["email"],
              message: "An account with this email already exists",
            });

          user.username === data.username &&
            ctx.addIssue({
              code: "custom",
              path: ["username"],
              message: "An account with this username already exists",
            });
        });
      }).transform(async (data) => {
        if (intent !== null) return { ...data, user: null };

        const user = await signup(data);

        return { ...data, user };
      }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.user) {
    return json(
      {
        result: submission.reply({
          hideFields: ["password", "confirmPassword"],
        }),
      },
      {
        status: submission.status === "error" ? 400 : 200,
      }
    );
  }

  const { user, remember } = submission.value;

  const headers = new Headers();

  const confettiCookie = await createConfettiCookie("signup-success");
  headers.append("set-cookie", confettiCookie);

  const toastCookie = await createToastCookie({
    description: "You have successfully signed up!",
    id: "signup-success",
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

  return redirect("/", { headers });
};

const SignupRoute = () => {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: SignupSchema }),
    shouldValidate: "onBlur",
  });

  return (
    <Form method="POST" {...getFormProps(form)} className="flex gap-4 flex-col">
      <Field
        {...getInputProps(fields.email, { type: "email" })}
        label="Email"
        errors={fields.email.errors}
        errorId={fields.email.errorId}
        autoComplete="email"
        autoFocus
      />
      <Field
        {...getInputProps(fields.username, { type: "text" })}
        label="Username"
        errors={fields.username.errors}
        errorId={fields.username.errorId}
        autoComplete="username"
      />
      <Field
        {...getInputProps(fields.name, { type: "text" })}
        label="Name"
        errors={fields.name.errors}
        errorId={fields.name.errorId}
        autoComplete="name"
      />
      <Field
        {...getInputProps(fields.password, { type: "password" })}
        label="Password"
        errors={fields.password.errors}
        errorId={fields.password.errorId}
        autoComplete="new-password"
      />
      <Field
        {...getInputProps(fields.confirmPassword, { type: "password" })}
        label="Confirm password"
        errors={fields.confirmPassword.errors}
        errorId={fields.confirmPassword.errorId}
        autoComplete="new-password"
      />

      <CheckboxField
        {...getInputProps(fields.remember, { type: "checkbox" })}
      />

      <ErrorList errors={form.errors} errorId={form.errorId} />
      <Button type="submit">Signup</Button>

      <HoneypotInputs />
      <AuthenticityTokenInput />
    </Form>
  );
};
export default SignupRoute;
