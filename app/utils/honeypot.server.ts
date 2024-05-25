import { Honeypot, SpamError } from 'remix-utils/honeypot/server';

export const honeypot = new Honeypot({
	encryptionSeed: process.env.HONEYPOT_SECRET,
});

export const checkHoneypot = (formData: FormData, path: string) => {
	try {
		honeypot.check(formData);
	} catch (error) {
		if (error instanceof SpamError) {
			console.error('🤖 Spam detected', path, error.message);
			throw new Response('Form not submitted properly', { status: 400 });
		}
		throw error;
	}
};
