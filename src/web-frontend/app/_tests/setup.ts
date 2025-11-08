/* REACT */
import React from "react";
/* PLUGINS */
import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";
/* UTILITIES */
import { server } from "@/app/_tests/server";
import { mockAbility } from "@/app/_tests/utils";

beforeAll(() => server.listen());
beforeEach(() => mockAbility());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

vi.mock("react", async () => {
	const actual = (await vi.importActual("react")) as typeof React;
	return {
		...actual,
		cache: vi.fn((fn) => fn),
		useOptimistic: vi.fn(),
	};
});

vi.mock("next-auth/react", async () => {
	const actual = await vi.importActual("next-auth/react");
	return {
		...actual,
		signIn: vi.fn(),
	};
});

vi.mock("next/navigation", async () => {
	const actual = await vi.importActual("next/navigation");
	return {
		...actual,
		useParams: vi.fn(),
		notFound: vi.fn(),
	};
});

vi.mock("@/app/_utils/permissions", async () => {
	const actual = await vi.importActual("@/app/_utils/permissions");
	return {
		...actual,
		defineAbility: vi.fn(() => ({
			can: vi.fn(),
			cannot: vi.fn(),
		})),
	};
});
