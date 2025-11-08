/* eslint-disable no-magic-numbers */
/* PLUGINS */
import { User } from "@/app/_entities/interface/old.user.interface";
import { AddUserData, EditUserData } from "@/app/_entities/types/user.type";
import {
	addUser,
	deleteUser,
	getUserById,
	getUsers,
	updateUser,
} from "@/mock/models/user.model.mjs";
import { http, HttpResponse, HttpHandler, PathParams } from "msw";

export const user_handlers: HttpHandler[] = [
	http.get("/users/", ({ request }) => {
		const url = new URL(request.url);
		const search = url.searchParams.get("search");
		const users = getUsers(search || undefined);
		return HttpResponse.json({
			status: true,
			result: users,
			error: null,
		});
	}),

	http.post<PathParams, AddUserData>("/users", async ({ request }) => {
		const { name, email, contact_number, website } = await request.json();
		const new_user = addUser({
			name,
			email,
			contact_number,
			website,
		});

		return HttpResponse.json({
			status: true,
			result: new_user,
			error: null,
		});
	}),

	http.get<Pick<User, "id">>("/users/:id", ({ params }) => {
		const { id } = params;
		const user = getUserById(id);

		if (!user) {
			return HttpResponse.json({
				status: false,
				result: null,
				error: "User not found",
			});
		}

		return HttpResponse.json({
			status: true,
			result: user,
			error: null,
		});
	}),

	http.put<Pick<User, "id">, EditUserData>(
		"/users/:id",
		async ({ params, request }) => {
			const { id } = params;
			const { name, email, contact_number, website } = await request.json();
			const updated_user = updateUser({
				id,
				data: {
					name,
					email,
					contact_number,
					website,
				},
			});

			if (!updated_user) {
				return HttpResponse.json({
					status: false,
					result: null,
					error: "User not found",
				});
			}

			return HttpResponse.json({
				status: true,
				result: updated_user,
				error: null,
			});
		},
	),

	http.delete<Pick<User, "id">>("/users/:id", ({ params }) => {
		const { id } = params;
		const deleted_user = deleteUser(id) as User;

		if (!deleted_user) {
			return HttpResponse.json({
				status: false,
				result: null,
				error: "User not found",
			});
		}

		return HttpResponse.json({
			status: true,
			result: deleted_user.id,
			error: null,
		});
	}),
];
