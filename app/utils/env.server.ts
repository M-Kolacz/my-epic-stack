import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  CSRF_SECRET: z.string(),
  CSRF_SIGN_SECTER: z.string(),
  HONEYPOT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export const validateEnv = () => {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables.");
  }
};

export const getEnv = () => {
  return {
    MODE: process.env.NODE_ENV,
  };
};

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
