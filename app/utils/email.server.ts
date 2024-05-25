import { z } from "zod";
import { getErrorMessage } from "./misc.tsx";

const EmailResponse = z.object({
	id: z.string(),
});

export const sendEmail = async (emailSettings: {
	to: string;
	subject: string;
	html: string;
}) => {
	const email = {
		from: "michal.kolacz44@gmail.com",
		...emailSettings,
	};

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		body: JSON.stringify(email),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
		},
	});

	const data = EmailResponse.parse(await response.json());

	if (response.ok) {
		console.info("✉️  Email sent", data.id);
		return { status: "success" } as const;
	} else {
		const error = getErrorMessage(data);
		console.error("❌ Email error:", error);
		return { status: "error", error } as const;
	}
};
