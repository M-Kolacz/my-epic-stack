import { faker } from "@faker-js/faker";
import { HttpResponse, type HttpHandler, http } from "msw";
import { z } from "zod";

const EmailSchema = z.object({
	to: z.string().email(),
	from: z.string().email(),
	subject: z.string(),
	html: z.string(),
});

export const resendHanlders: Array<HttpHandler> = [
	http.post("https://api.resend.com/emails", async ({ request }) => {
		const body = await request.json();
		const email = EmailSchema.parse(body);

		console.info("💌 Mocked email sent", email);

		return HttpResponse.json({
			id: faker.string.uuid(),
		});
	}),
];
