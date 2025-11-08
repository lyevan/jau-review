/* PLUGINS */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
/* COMPONENTS */
import Header from "@/app/(pages)/(main)/users/_components/Header";
import Providers from "@/app/_tests/Providers";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

describe("Header Component", () => {
	const renderComponent = () => {
		render(
			<NuqsTestingAdapter>
				<Header />
			</NuqsTestingAdapter>,
			{ wrapper: Providers },
		);
		const user = userEvent.setup();
		return { user };
	};

	it("should render the header component", () => {
		renderComponent();

		expect(screen.getByText("Users")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/search user/i)).toBeInTheDocument();
	});

	it("should show setAddUserModal when Add User button is clicked", async () => {
		const { user } = renderComponent();
		const add_button = screen.getByRole("button", { name: /add user/i });

		await user.click(add_button);

		expect(screen.getByRole("dialog", { name: /add user/i })).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /cancel/i }));
	});

	it("should update search input when typing", async () => {
		const { user } = renderComponent();
		const search_input = screen.getByRole("textbox");
		const search_value = "test search";
		await user.type(search_input, search_value);

		expect(search_input).toHaveValue(search_value);
	});
});
