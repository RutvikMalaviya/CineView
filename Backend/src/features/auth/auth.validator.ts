import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(40).optional(),
  city: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(16).max(256),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(256),
  newPassword: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
