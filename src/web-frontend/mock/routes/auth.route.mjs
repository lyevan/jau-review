export default function authRoutes(app) {
	app.post("/api/auth/signin", (req, res) => {
		const { email_address, password } = req.body;

		console.log("email_address", email_address);
		console.log("password", password);

		/* SuperAdmin user */
		if (email_address === "superadmin@gmail.com" && password === "SuperAdmin123") {
			res.jsonp({
				status: true,
				result: {
					access_token:
						"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlN1cGVyQWRtaW4xMjMiLCJ0eXBlIjoiYWNjIiwicm9sZSI6MSwiZmlyc3RfbmFtZSI6IlN1cGVyIiwiZW1haWwiOiJzdXBlcmFkbWluQGdtYWlsLmNvbSIsImlhdCI6MTc0MTA1NDIxNywiZXhwIjoxNzQxMDU0Mjc3fQ.superadmin_token_signature",
					refresh_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVzZXIxMjMiLCJpYXQiOjE3MjkwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.RWkGz1KXESiGDRBr7g6YAk6Um4ufzzKy2Fbv9Xx_z4Q",
				},
				error: null,
			});
		}

		/* Admin user */
		else if (email_address === "admin@gmail.com" && password === "Admin123") {
			res.jsonp({
				status: true,
				result: {
					access_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkFkbWluMTIzIiwidHlwZSI6ImFjYyIsInJvbGUiOjIsImZpcnN0X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzI5MDAwMDAwLCJleHAiOjIwNTAwMDAwMDB9.tSBx43asP6WFX5ovT7YIN8mMKXZVlaAcq89UmqRXijQ",
					refresh_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVzZXIxMjMiLCJpYXQiOjE3MjkwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.RWkGz1KXESiGDRBr7g6YAk6Um4ufzzKy2Fbv9Xx_z4Q",
				},
				error: null,
			});
		}

		/* Doctor user */
		else if (email_address === "doctor@gmail.com" && password === "Doctor123") {
			res.jsonp({
				status: true,
				result: {
					access_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRvY3RvcjEyMyIsInR5cGUiOiJhY2MiLCJyb2xlIjo0LCJmaXJzdF9uYW1lIjoiRG9jdG9yIiwiZW1haWwiOiJkb2N0b3JAZ21haWwuY29tIiwiaWF0IjoxNzI5MDAwMDAwLCJleHAiOjIwNTAwMDAwMDB9.KCNqZCkiEtewSeoUXZ1y_rG7QBLQwz0_TwUWWbeb-Uw",
					refresh_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVzZXIxMjMiLCJpYXQiOjE3MjkwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.RWkGz1KXESiGDRBr7g6YAk6Um4ufzzKy2Fbv9Xx_z4Q",
				},
				error: null,
			});
		}

		/* Patient user */
		else if (email_address === "patient@gmail.com" && password === "Patient123") {
			res.jsonp({
				status: true,
				result: {
					access_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlBhdGllbnQxMjMiLCJ0eXBlIjoiYWNjIiwicm9sZSI6MywiZmlyc3RfbmFtZSI6IlBhdGllbnQiLCJlbWFpbCI6InBhdGllbnRAZ21haWwuY29tIiwiaWF0IjoxNzI5MDAwMDAwLCJleHAiOjIwNTAwMDAwMDB9.G__Kq5ctDV3UBqeVjqpY9FKekb5sfHNYNANvh03hkwM",
					refresh_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVzZXIxMjMiLCJpYXQiOjE3MjkwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.RWkGz1KXESiGDRBr7g6YAk6Um4ufzzKy2Fbv9Xx_z4Q",
				},
				error: null,
			});
		}

		/* Staff user */
		else if (email_address === "staff@gmail.com" && password === "Staff123") {
			res.jsonp({
				status: true,
				result: {
					access_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlN0YWZmMTIzIiwidHlwZSI6ImFjYyIsInJvbGUiOjUsImZpcnN0X25hbWUiOiJTdGFmZiIsImVtYWlsIjoic3RhZmZAZ21haWwuY29tIiwiaWF0IjoxNzI5MDAwMDAwLCJleHAiOjIwNTAwMDAwMDB9.8HpGo4aUyejBSjftqBqDswR12siq8eQMOLDtlbUDtqU",
					refresh_token:
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVzZXIxMjMiLCJpYXQiOjE3MjkwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.RWkGz1KXESiGDRBr7g6YAk6Um4ufzzKy2Fbv9Xx_z4Q",
				},
				error: null,
			});
		}

		/* Invalid credentials */
		else {
			res.jsonp({
				status: false,
				result: null,
				error: "Invalid credentials",
			});
		}
	});
}
