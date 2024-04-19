import { Button } from "#app/components/ui/button";
import { Input } from "#app/components/ui/input";
import { Label } from "#app/components/ui/label";
import { Form, useActionData } from "@remix-run/react";
import { LoginSchema } from "#app/utils/schema";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
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
      <Label id={fields.username.id}>Username</Label>
      <Input
        {...getInputProps(fields.username, { type: "text" })}
        autoFocus
        autoComplete="username"
      />
      <Label id={fields.password.id}>Password</Label>
      <Input
        {...getInputProps(fields.password, { type: "password" })}
        autoComplete="current-password"
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default LoginRoute;
