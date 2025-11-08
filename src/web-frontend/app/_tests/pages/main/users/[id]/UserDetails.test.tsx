/* PLUGINS */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
/* UTILITIES */
import { mockUseParams } from "@/app/_tests/utils";
/* COMPONENTS */
import UserDetails from "@/app/(pages)/(main)/users/[id]/_components/UserDetails";
import Providers from "@/app/_tests/Providers";
/* CONSTANTS */
import { ZERO } from "@/app/_constants";
/* DATA */
import { users } from "@/mock/data/user.data.mjs";

describe("UserDetails Component", () => {
	const mock_user = users[ZERO];
	const renderComponent = (id = "1") => {
		mockUseParams(id);
		render(<UserDetails />, { wrapper: Providers });
	};

	it("should not display User Details when no data", () => {
		renderComponent("xyz");

		expect(screen.queryByText("User Details")).not.toBeInTheDocument();
	});

	it("should display user details when data is loaded", async () => {
		renderComponent("1");

		await waitFor(() => {
			expect(screen.getByText(mock_user.name)).toBeInTheDocument();
			expect(screen.getByText(mock_user.email)).toBeInTheDocument();
			expect(screen.getByText(mock_user.contact_number)).toBeInTheDocument();
			expect(screen.getByText(mock_user.website)).toBeInTheDocument();
		});
	});

	it("should render website as a clickable external link", async () => {
		renderComponent("1");
		await waitFor(() => {
			const website_link = screen.getByText(mock_user.website);
			expect(website_link).toBeInTheDocument();
			expect(website_link.tagName).toBe("A");
			expect(website_link).toHaveAttribute("href", mock_user.website);
			expect(website_link).toHaveAttribute("target", "_blank");
		});
	});

	it("should render a button with home link", async () => {
		renderComponent("1");
		await waitFor(() => {
			const website_link = screen.getByRole("link", { name: /back/i });
			expect(website_link).toBeInTheDocument();
			expect(website_link.tagName).toBe("A");
			expect(website_link).toHaveAttribute("href", "/users");
		});
	});
});
