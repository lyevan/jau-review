/* PLUGINS */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
/* UTILITIES */
import { mockAbility } from "@/app/_tests/utils";
/* COMPONENTS */
import ConfirmDeleteModal from "@/app/(pages)/(main)/users/_components/ConfirmDeleteModal";
import Providers from "@/app/_tests/Providers";
import { Toaster } from "react-hot-toast";
/* CONSTANTS */
import { ONE, ZERO } from "@/app/_constants";
/* ENTITIES */
import { AccountType } from "@/app/_entities/enums/auth.enum";
import { User } from "@/app/_entities/interface/old.user.interface";
/* DATA */
import { users } from "@/mock/data/user.data.mjs";

describe("ConfirmDeleteModal Component", () => {
	const renderComponent = ({ user_data = users[ZERO] }: { user_data?: User } = {}) => {
		render(
			<>
				<ConfirmDeleteModal user={user_data} />
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
		const delete_button = screen.getByRole("img");

		await user.click(delete_button);

		expect(screen.getByRole("dialog", { name: /delete/i })).toBeInTheDocument();
	});

	it("should close modal when Cancel button is clicked", async () => {
		const { user } = renderComponent();
		const delete_button = screen.getByRole("img");

		await user.click(delete_button);

		expect(screen.getByRole("dialog", { name: /delete/i })).toBeInTheDocument();
	});

	it("should submit form data when Submit button is clicked", async () => {
		const { user } = renderComponent();
		const delete_button = screen.getByRole("img");

		await user.click(delete_button);
		await user.click(screen.getByRole("button", { name: /delete/i }));

		expect(screen.getByText(/success/i)).toBeInTheDocument();
	});
});
