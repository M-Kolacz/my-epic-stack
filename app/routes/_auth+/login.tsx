import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { Field, ErrorList, CheckboxField } from "#app/components/form";
import { Button } from "#app/components/ui/button";
import { login, requireAnonymous } from "#app/utils/auth.server";
import { authSessionStorage } from "#app/utils/authSession.server";
import { createConfettiCookie } from "#app/utils/confetti.server";
import { checkCsrf } from "#app/utils/csrf.server";
import { sendEmail } from "#app/utils/email.server";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { LoginSchema } from "#app/utils/schema";
import { getPath } from "#app/utils/server";
import { createToastCookie } from "#app/utils/toast.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireAnonymous(request);

	await sendEmail({
		to: "michal.kolacz45@gmail.com",
		subject: "Hello world",
		html: "<h1>Hello world</h1>",
	});

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
				if (intent !== null) return { ...data, session: null };

				const session = await login(data);

				if (!session) {
					ctx.addIssue({
						code: "custom",
						message: "Invalid username or password",
					});
					return z.NEVER;
				}

				return { ...data, session };
			}),
		async: true,
	});

	if (submission.status !== "success" || !submission.value.session) {
		return json(
			{ result: submission.reply({ hideFields: ["password"] }) },
			{
				status: submission.status === "error" ? 400 : 200,
			},
		);
	}

	const { remember, session, redirectTo } = submission.value;

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
		request.headers.get("cookie"),
	);
	authSession.set("sessionId", session.id);
	headers.append(
		"set-cookie",
		await authSessionStorage.commitSession(authSession, {
			expires: remember ? session.expirationDate : undefined,
		}),
	);

	return redirect(safeRedirect(redirectTo, "/"), {
		headers,
	});
};

const LoginRoute = () => {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	const redirectTo = searchParams.get("redirectTo");

	const [form, fields] = useForm({
		id: "login-form",
		constraint: getZodConstraint(LoginSchema),
		defaultValue: {
			redirectTo,
		},
		lastResult: actionData?.result,
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: LoginSchema }),
		shouldValidate: "onBlur",
	});

	return (
		<Form
			method="POST"
			{...getFormProps(form)}
			className="flex flex-col gap-4">
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

			<input {...getInputProps(fields.redirectTo, { type: "hidden" })} />

			<ErrorList errors={form.errors} errorId={form.errorId} />
			<Button type="submit">Submit</Button>

			<HoneypotInputs />
			<AuthenticityTokenInput />
		</Form>
	);
};

export default LoginRoute;
