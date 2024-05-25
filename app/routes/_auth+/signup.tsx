import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { Field, ErrorList } from "#app/components/form";
import { Button } from "#app/components/ui/button";
import { requireAnonymous } from "#app/utils/auth.server";
import { checkCsrf } from "#app/utils/csrf.server";
import { prisma } from "#app/utils/db.server";
import { sendEmail } from "#app/utils/email.server";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { SignupSchema } from "#app/utils/schema";
import { getPath } from "#app/utils/server";
import { verifySessionStorage } from "#app/utils/verifySession.server";

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
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findMany({
				where: { OR: [{ email: data.email }] },
				select: { id: true, email: true },
			});

			existingUser.forEach((user) => {
				user.email === data.email &&
					ctx.addIssue({
						code: "custom",
						path: ["email"],
						message: "An account with this email already exists",
					});
			});
		}),
		async: true,
	});

	if (submission.status !== "success" || !submission.value.email) {
		return json(
			{
				result: submission.reply(),
			},
			{
				status: submission.status === "error" ? 400 : 200,
			},
		);
	}

	const { email } = submission.value;

	const response = await sendEmail({
		to: email,
		subject: "Welcome to Conform-to",
		html: "<h1>Welcome to Conform-to</h1>",
	});

	const headers = new Headers();

	if (response.status === "success") {
		const verifySession = await verifySessionStorage.getSession(
			request.headers.get("cookie"),
		);
		verifySession.set("email", email);

		headers.append(
			"set-cookie",
			await verifySessionStorage.commitSession(verifySession),
		);

		return redirect("/onboarding", { headers });
	} else {
		return json(
			{
				result: submission.reply({ formErrors: [response.error] }),
			},
			{ status: 500 },
		);
	}
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
		<Form
			method="POST"
			{...getFormProps(form)}
			className="flex flex-col gap-4">
			<Field
				{...getInputProps(fields.email, { type: "email" })}
				label="Email"
				errors={fields.email.errors}
				errorId={fields.email.errorId}
				autoComplete="email"
				autoFocus
			/>

			<ErrorList errors={form.errors} errorId={form.errorId} />
			<Button type="submit">Signup</Button>

			<HoneypotInputs />
			<AuthenticityTokenInput />
		</Form>
	);
};
export default SignupRoute;
