import { Button } from "#app/components/ui/button";
import { Form, useActionData } from "@remix-run/react";
import { LoginSchema } from "#app/utils/schema";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Field } from "#app/components/form";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { checkCsrf } from "#app/utils/csrf.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await checkCsrf(request);

  const formData = await request.formData();
  checkHoneypot(formData);

  const submission = parseWithZod(formData, { schema: LoginSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  return redirect("/users");
};

const LoginRoute = () => {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(LoginSchema),
    lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: LoginSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
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

      <Button type="submit">Submit</Button>

      <HoneypotInputs />
      <AuthenticityTokenInput />
    </Form>
  );
};

export default LoginRoute;
