import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(50),
});

export const ThemeSchema = z.object({
  theme: z.enum(["light", "dark"]),
});
