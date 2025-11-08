/* PLUGINS */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn, SignInResponse } from "next-auth/react";
/* COMPONENTS */
import LoginForm from "@/app/(pages)/(auth)/login/_components/LoginForm";
import Providers from "@/app/_tests/Providers";
import { Toaster } from "react-hot-toast";

describe("LoginForm Component", () => {
	const renderComponent = () => {
		render(
			<>
				<LoginForm />
				<Toaster />
			</>,
			{ wrapper: Providers },
		);

		const user = userEvent.setup();

		const mockSignIn = (response: SignInResponse) => {
			vi.mocked(signIn).mockResolvedValue(response);
		};

		return {
			user,
			email_input: screen.getByPlaceholderText(/email address/i),
			password_input: screen.getByPlaceholderText(/password/i),
			login_button: screen.getByRole("button", { name: "Login" }),
			mockSignIn,
		};
	};

	it("should renders login form with all required elements", () => {
		const { email_input, password_input, login_button } = renderComponent();
		
		expect(
			screen.getByRole("heading", {
				name: /login/i,
				level: 1,
			}),
		).toBeInTheDocument();
		expect(email_input).toBeInTheDocument();
		expect(password_input).toBeInTheDocument();
		expect(login_button).toBeInTheDocument();
	});

	it("should allow typing in the email and password fields", async () => {
		const { user, email_input, password_input } = renderComponent();
		const email_value = "test@example.com";
		const password_value = "password123";
		await user.type(email_input, email_value);
		await user.type(password_input, password_value);

		expect(email_input).toHaveValue(email_value);
		expect(password_input).toHaveValue(password_value);
	});

	it("should submit the form with valid credentials", async () => {
		const originalLocation = window.location;
		const mockLocation = { href: "" };
		const { user, email_input, password_input, login_button, mockSignIn } = renderComponent();

		await user.type(email_input, "test@example.com");
		await user.type(password_input, "password123");

		Object.defineProperty(window, "location", {
			value: mockLocation,
			writable: true,
		});
		mockSignIn({
			ok: true,
			url: "/users",
			error: null,
			status: 200,
		});
		await user.click(login_button);
		await waitFor(() => {
			expect(signIn).toHaveBeenCalledWith("credentials", {
				email_address: "test@example.com",
				password: "password123",
				redirect: false,
			});
			expect(window.location.href).toBe("/users");
		});

		Object.defineProperty(window, "location", {
			configurable: true,
			value: originalLocation,
		});
	});

	it("should show error when login fails due to invalid credentials", async () => {
		const { user, email_input, password_input, login_button, mockSignIn } = renderComponent();
		const email_value = "wrong@example.com";
		const password_value = "wrong_password";

		await user.type(email_input, email_value);
		await user.type(password_input, password_value);
		mockSignIn({ error: "Invalid credentials", status: 401, ok: false, url: null });
		await user.click(login_button);

		await waitFor(() => {
			expect(signIn).toHaveBeenCalledWith("credentials", {
				email_address: email_value,
				password: password_value,
				redirect: false,
			});
		});
		expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
	});
});
