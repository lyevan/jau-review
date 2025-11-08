/* PLUGINS */
import { http, HttpResponse } from "msw";

export const auth_handlers = [
	http.get("/api/auth/session", () => {
		return HttpResponse.json({});
	}),
];
