/* PLUGINS */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
/* COMPONENTS */
import UserTable from "@/app/(pages)/(main)/users/_components/UserTable";
import Providers from "@/app/_tests/Providers";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
/* CONSTANTS */
import { ZERO } from "@/app/_constants";

describe("UserTable Component", () => {
	const renderComponent = (search_params?: Record<string, string>) => {
		render(
			<NuqsTestingAdapter searchParams={search_params}>
				<UserTable />
			</NuqsTestingAdapter>,
			{ wrapper: Providers },
		);
	};

	it("should render table headers correctly", () => {
		renderComponent();

		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByText("Contact Number")).toBeInTheDocument();
		expect(screen.getByText("Website")).toBeInTheDocument();
		expect(screen.getByText("Action")).toBeInTheDocument();
	});

	it("should render loading skeletons when data is loading", () => {
		renderComponent();

		expect(screen.queryAllByRole("progressbar")).not.toHaveLength(ZERO);
	});

	it("should render user rows when data is loaded successfully", async () => {
		renderComponent();
		await waitFor(() => expect(screen.getByText("Leanne Graham")).toBeInTheDocument());
	});

	it("should render error message when fetch fails", async () => {
		renderComponent({
			search: "xyz",
		});

		await waitFor(() => expect(screen.getByText("No data found")).toBeInTheDocument());
	});
});
