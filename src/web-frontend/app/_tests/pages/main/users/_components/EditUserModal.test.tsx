/* PLUGINS */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
/* UTILITIES */
import { mockAbility } from "@/app/_tests/utils";
/* COMPONENTS */
import EditUserModal from "@/app/(pages)/(main)/users/_components/EditUserModal";
import Providers from "@/app/_tests/Providers";
import { Toaster } from "react-hot-toast";
/* CONSTANTS */
import { ONE, ZERO } from "@/app/_constants";
/* ENTITIES */
import { AccountType } from "@/app/_entities/enums/auth.enum";
import { User } from "@/app/_entities/interface/old.user.interface";
/* DATA */
import { users } from "@/mock/data/user.data.mjs";

describe("EditUserModal Component", () => {
	const renderComponent = ({ user_data = users[ZERO] }: { user_data?: User } = {}) => {
		render(
			<>
				<EditUserModal user={user_data} />
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
			assert: () => {
				expect(screen.queryByRole("img")).toBeInTheDocument();
			},
		},
		{
			type: "SuperAdmin for different user",
			role: AccountType.SuperAdmin,
			user_id: "1",
			different_user: users[ONE],
			assert: () => {
				expect(screen.queryByRole("img")).toBeInTheDocument();
			},
		},
		{
			type: "Admin",
			role: AccountType.Admin,
			user_id: "1",
			assert: () => {
				expect(screen.queryByRole("img")).toBeInTheDocument();
			},
		},
		{
			type: "Admin for different user",
			role: AccountType.Admin,
			user_id: "1",
			different_user: users[ONE],
			assert: () => {
				expect(screen.queryByRole("img")).not.toBeInTheDocument();
			},
		},
		{
			type: "User",
			role: AccountType.User,
			user_id: "1",
			assert: () => {
				expect(screen.queryByRole("img")).toBeInTheDocument();
			},
		},
		{
			type: "User for different user",
			role: AccountType.User,
			user_id: "1",
			different_user: users[ONE],
			assert: () => {
				expect(screen.queryByRole("img")).not.toBeInTheDocument();
			},
		},
	])(
		"should show the add user button when role is $type",
		async ({ different_user, assert, role, user_id }) => {
			await mockAbility({
				role,
				user_id,
			});
			renderComponent({ user_data: different_user });

			assert();
		},
	);

	it("should render the modal", async () => {
		const { user } = renderComponent();
		const edit_button = screen.getByRole("img");

		await user.click(edit_button);

		expect(screen.getByRole("dialog", { name: /edit/i })).toBeInTheDocument();
	});

	it("should close modal when Cancel button is clicked", async () => {
		const { user } = renderComponent();
		const edit_button = screen.getByRole("img");

		await user.click(edit_button);
		const cancel_button = screen.getByRole("button", { name: "Cancel" });

		await user.click(cancel_button);
		expect(screen.queryByRole("dialog", { name: /edit/i })).not.toBeInTheDocument();
	});

	it("should submit form data when Submit button is clicked", async () => {
		const { user } = renderComponent();
		const edit_user_button = screen.getByRole("img");
		await user.click(edit_user_button);
		const name_input = screen.getByPlaceholderText(/name/i);
		const submit_button = screen.getByRole("button", { name: "Submit" });

		await user.clear(name_input);
		await user.type(name_input, "edit name");

		await user.click(submit_button);

		expect(screen.getByText(/success/i)).toBeInTheDocument();
	});

	it("should show error message when invalid data is submitted", async () => {
		const { user } = renderComponent();
		const edit_user_button = screen.getByRole("img");
		await user.click(edit_user_button);
		const name_input = screen.getByPlaceholderText(/name/i);
		const submit_button = screen.getByRole("button", { name: "Submit" });

		await user.clear(name_input);

		await user.click(submit_button);

		expect(screen.getByText(/required/i)).toBeInTheDocument();
	});
});
