/* PLUGINS */
import { z } from "zod";

/* CONSTANTS */
import { MAX_FILE_SIZE, ONE } from "@/app/_constants";

/* ENTITIES */
import { Access } from "@/app/_entities/enums/user.enum";

export const add_user_schema = z
	.object({
		first_name: z.string().trim().optional(),
		last_name: z.string().trim().optional(),
		client_id: z.string().optional(),
		access: z.nativeEnum(Access).optional(),
		email: z.string().trim().optional(),
		import: z
			.custom<File>((file) => file instanceof File, {
				message: "File must be a valid file",
			})
			.refine((files) => files.size < MAX_FILE_SIZE, "Max file size is 25MB")
			.refine(
				(file) => {
					const validTypes = ["application/vnd.ms-excel" /* .xls */, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" /* .xlsx */];
					return validTypes.includes(file.type);
				},
				{
					message: "Only Excel files (.xls, .xlsx) are supported",
				},
			)
			.optional()
			.nullable(),
	})
	.superRefine((data, ctx) => {
		const has_import = !!data.import;

		if (!has_import) {
			if (!data.first_name) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["first_name"],
					message: "First name is required",
				});
			}
			if (!data.last_name) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["last_name"],
					message: "Last name is required",
				});
			}
			if (!data.client_id) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["client_id"],
					message: "Client is required",
				});
			}
			if (!data.email) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["email"],
					message: "Email is required"
				});
			} 
			else {
				const validate_email = z.string().email().safeParse(data.email);
				if (!validate_email.success) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["email"],
						message: "Invalid email format"
					});
				}
			}
		}
	});

export type AddUserSchema = z.infer<typeof add_user_schema>;

export const update_user_schema = z.object({
	id: z.number().min(ONE, "User ID is required"),
	first_name: z.string().trim().min(ONE, "First name is required"),
	last_name: z.string().trim().min(ONE, "Last name is required"),
	client_id: z.string().optional(),
	access: z.nativeEnum(Access),
	email: z.string().email("Invalid email address"),
});

export type UpdateUserSchema = z.infer<typeof update_user_schema>;
