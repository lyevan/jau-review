/* PLUGINS */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
/* UTILITIES */
import { mockAbility } from "@/app/_tests/utils";
/* COMPONENTS */
import AddUserModal from "@/app/(pages)/(main)/users/_components/AddUserModal";
import Providers from "@/app/_tests/Providers";
import { Toaster } from "react-hot-toast";
/* ENTITIES */
import { AccountType } from "@/app/_entities/enums/auth.enum";
/* CONSTANTS */
import { FOUR } from "@/app/_constants";

describe("AddUserModal Component", () => {
	const renderComponent = () => {
		render(
			<>
				<AddUserModal />
				<Toaster />
			</>,
			{ wrapper: Providers },
		);

		const user = userEvent.setup();

		return {
			user,
		};
	};

	it.each([
		{
			type: "SuperAdmin",
			role: AccountType.SuperAdmin,
			user_id: "1",
		},
		{
			type: "Admin",
			role: AccountType.Admin,
			user_id: "1",
		},
		{
			type: "User",
			role: AccountType.User,
			user_id: "1",
		},
	])("should show the add user button when role is $type", async ({ type, ...permission }) => {
		await mockAbility(permission);
		renderComponent();

		if (type === "User") {
			expect(screen.queryByRole("button", { name: /add user/i })).not.toBeInTheDocument();
		} 
		else {
			expect(screen.queryByRole("button", { name: /add user/i })).toBeInTheDocument();
		}
	});

	it("should render the modal", async () => {
		const { user } = renderComponent();
		expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
		const add_user_button = screen.getByRole("button", { name: /add user/i });
		await user.click(add_user_button);
		expect(screen.getByRole("dialog", { name: /add user/i })).toBeInTheDocument();
	});

	it("should close modal when Cancel button is clicked", async () => {
		const { user } = renderComponent();
		const cancel_button = screen.getByRole("button", { name: "Cancel" });

		await user.click(cancel_button);

		expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
	});

	it("should submit form data when Submit button is clicked", async () => {
		const { user } = renderComponent();
		const add_user_button = screen.getByRole("button", { name: /add user/i });
		await user.click(add_user_button);
		const name_input = screen.getByPlaceholderText(/name/i);
		const email_input = screen.getByPlaceholderText(/email address/i);
		const contact_input = screen.getByPlaceholderText(/contact number/i);
		const website_input = screen.getByPlaceholderText(/website url/i);
		const submit_button = screen.getByRole("button", { name: "Submit" });

		await user.type(name_input, "John Doe");
		await user.type(email_input, "john@example.com");
		await user.type(contact_input, "(123) 321-1232");
		await user.type(website_input, "https://example.com");

		await user.click(submit_button);

		expect(screen.getByText(/success/i)).toBeInTheDocument();
	});

	it("should show error message when invalid data is submitted", async () => {
		const { user } = renderComponent();
		const add_user_button = screen.getByRole("button", { name: /add user/i });
		await user.click(add_user_button);
		const name_input = screen.getByPlaceholderText(/name/i);
		const email_input = screen.getByPlaceholderText(/email address/i);
		const contact_input = screen.getByPlaceholderText(/contact number/i);
		const website_input = screen.getByPlaceholderText(/website url/i);
		const submit_button = screen.getByRole("button", { name: "Submit" });

		await user.type(name_input, " ");
		await user.type(email_input, " ");
		await user.type(contact_input, " ");
		await user.type(website_input, " ");

		await user.click(submit_button);

		expect(screen.getAllByText(/required/i)).toHaveLength(FOUR);
	});
});
