import { Honeypot, SpamError } from "remix-utils/honeypot/server";

export const honeypot = new Honeypot({
  encryptionSeed: "my-secret-key",
});

export const checkHoneypot = (formData: FormData) => {
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      console.warn("🤖 Spam detected", error);
      throw new Response("Form not submitted properly", { status: 400 });
    }
    throw error;
  }
};
