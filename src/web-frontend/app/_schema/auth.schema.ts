/* PLUGINS */
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

export const login_schema = z.object({
	email_address: z.string().email("Invalid email address"),
	password: z.string(),
});

export const forgot_password_schema = z.object({
	email_address: z.string().email("Invalid email address"),
});

export const set_password_schema = z.object({
	email_address: z.string().email("Invalid email address"),
	password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`),
	confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
	message: "Passwords do not match",
	path: ["confirm_password"],
});

export type LoginFormData = z.infer<typeof login_schema>;
export type ForgotPasswordFormData = z.infer<typeof forgot_password_schema>;
export type SetPasswordFormData = z.infer<typeof set_password_schema>;
