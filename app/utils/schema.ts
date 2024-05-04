import { z } from "zod";
import { alphanumericWithUnderscore } from "#app/utils/regex";

const username = z
  .string({ required_error: "Username is required" })
  .min(3, { message: "Username is too short" })
  .max(20, { message: "Username is too long" })
  .regex(alphanumericWithUnderscore, {
    message: "Username can only include letters, numbers, and underscores",
  })
  .transform((value) => value.toLowerCase());

const password = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password is too short" })
  .max(50, { message: "Password is too long" });

const name = z
  .string({ required_error: "Name is required" })
  .min(3, { message: "Name is too short" })
  .max(20, { message: "Name is too long" });

const email = z
  .string({ required_error: "Email is required" })
  .email({ message: "Email is invalid" })
  .min(3, { message: "Email is too short" })
  .max(50, { message: "Email is too long" })
  .transform((value) => value.toLowerCase());

const PasswordAndConfirmPasswordSchema = z
  .object({
    password,
    confirmPassword: password,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "The passwords must match",
      });
    }
  });

export const LoginSchema = z.object({
  username,
  password,
});

export const SignupSchema = z
  .object({
    email,
    username,
    name,
  })
  .and(PasswordAndConfirmPasswordSchema);

export const ThemeSchema = z.object({
  theme: z.enum(["light", "dark"]),
});
