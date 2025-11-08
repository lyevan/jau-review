/* REACT */
import { redirect } from "next/navigation";
/* PLUGINS */
import { SvgIconId } from "@/app/_components/SvgIcon";
import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { StoreApi, UseBoundStore } from "zustand";
import { InfiniteData } from "@tanstack/react-query";
/* ENTITIES */
import { AxiosError } from "axios";
/* CONSTANTS */
import { SIGNOUT_ERROR, ZERO, BYTES_PER_MB, DECIMALS, ONE, SIX, MINUTES_PER_HOUR, HOURS_PER_DAY, DAYS_PER_WEEK, MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_SECOND, SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from "@/app/_constants";

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

/**
 * DOCU: Creates selector hooks for a Zustand store to access individual state slices without causing unnecessary re-renders. <br>
 * Triggered: When initializing a Zustand store that needs selectors for optimized component updates. <br>
 * @param {UseBoundStore<StoreApi<object>>} _store - The Zustand store to create selectors for
 * @returns {WithSelectors<S>} The original store enhanced with a `use` object containing selector hooks
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
	const store = _store as WithSelectors<typeof _store>;
	store.use = {};
	for (const k of Object.keys(store.getState())) {
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		(store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
	}

	return store;
};

/**
 * DOCU: Merges multiple class names using clsx and tailwind-merge to handle conditional classes. <br>
 * Triggered: When dynamic class names need to be combined in component rendering. <br>
 * @param {ClassValue[]} inputs - Array of class names, objects, or arrays to be merged
 * @returns {string} A single string of merged and optimized class names
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * DOCU: Extracts a readable error message from different error types and provides a fallback for unknown error types. <br>
 * Triggered: When handling errors in try/catch blocks or error boundaries across the application. <br>
 * Last Updated Date: March 16, 2022
 * @param {unknown} error - The error object or message to format
 * @returns {string} A human-readable error message
 */
export const formatErrorMessage = (error: unknown) => {
	if (typeof error === "string") {
		return error;
	} else if (error instanceof AxiosError) {
		return error.message;
	} else if (error instanceof Error) {
		return error.message;
	} else {
		return "Something went wrong. Please try again.";
	}
};

/**
 * DOCU: Checks if an error matches the authentication error that requires re-login and throws it if matched. <br>
 * Triggered: When an error occurs in authenticated API requests to determine if it's an authentication issue. <br>
 * Last Updated Date: December 10, 2024
 * @param {string} error - The error message to evaluate
 * @throws {string} Throws the error if it matches the authentication error requiring re-login
 */
export function throwAuthenticationError(error: string) {
	if (error === SIGNOUT_ERROR) {
		throw error;
	}
}

/**
 * DOCU: Redirects the user to the sign-out endpoint when an authentication error is detected. <br>
 * Triggered: When an authentication error occurs during API requests or component rendering. <br>
 * Last Updated Date: January 15, 2025
 * @param {unknown} error - The error to check against authentication failure conditions
 * @returns {never|void} Either redirects (never returns) or returns void if not an auth error
 */
export const signOutUnauthenticatedUser = (error: unknown) => {
	if (error === SIGNOUT_ERROR) {
		redirect("/api/sign-out");
	}
};

/**
 * DOCU: Copies the provided text to the clipboard and shows a toast message for success/error. <br>
 * Triggered: When a "copy link" or similar action is performed in the UI. <br>
 * Last Updated Date: August 8, 2025
 * @param {string} copy_text - The text to copy to the clipboard
 * @param {string} success_message - Optional success message for the toast
 * @param {string} error_message - Optional error message for the toast
 * @returns {Promise<void>} Resolves when the copy attempt completes
 */
export async function handleCopyLink(copy_text: string, success_message: string = "Link copied to clipboard!", error_message: string = "Failed to copy link"): Promise<void> {
	try {
		await navigator.clipboard.writeText(copy_text);
		toast.success(success_message);
	} catch {
		toast.error(error_message);
	}
}

/**
 * DOCU: Determines the appropriate file icon based on material type and hover state. <br>
 * Triggered: When displaying materials in session components. <br>
 * Last Updated Date: September 3, 2025
 * @param {Blob.type} type - The type of material (pdf, excel, image, other)
 * @param {boolean} is_hover - Whether the icon is in hover state
 * @returns {SvgIconId} The appropriate icon ID for the material type
 * 
 */
export function getFileIcon(type: Blob["type"], is_hover: boolean = false): SvgIconId {
	const is_image = type === "image/png";

	if (is_hover) {
		return is_image ? "icon-line-image-active" : "icon-line-file-default";
	}

	return is_image ? "icon-line-image-default" : "icon-line-file-default";
}

/**
 * DOCU: Formats session dates to a human-readable format without year. <br>
 * Triggered: When displaying session dates in SessionItem components. <br>
 * Last Updated Date: August 8, 2025
 * @param {string} date_string - The date string to format
 * @returns {string} Formatted date string (e.g., "Aug 20 at 9:30 AM")
 */
export function formatSessionDate(date_string: string): string {
	try {
		/* Handle custom format like "2025-08-20 at 9:30 AM" */
		if (date_string.includes(" at ")) {
			const [date_part] = date_string.split(" at ");
			const date = parseISO(date_part);
			return format(date, "MMM d 'at' h:mm a");
		}

		/* Handle ISO format */
		const date = parseISO(date_string);
		return format(date, "MMM d 'at' h:mm a");
	} catch {
		/* Fallback to original date if parsing fails */
		return date_string;
	}
}

/**
 * DOCU: Will get the total length data from useInfiniteQuery. <br>
 * Triggered: When infinite scrolling. <br>
 * Last Updated Date: August 25, 2025
 * 
 */
export function getInfiniteDataTotalLength<T>(data: InfiniteData<T[] | undefined> | undefined) {
	return data?.pages.reduce((total, page) => total + (page?.length ?? ZERO), ZERO) ?? ZERO;
}

/**
 * DOCU: Will get the filename from the URL. <br>
 * Triggered: when displaying the filename of a url. <br>
 * Last Updated Date: September 18, 2025
 * 
 */
export const getFilenameFromUrl = (url?: string): string => {
	if (!url) {
		return "";
	}

	return url.split("?")[ZERO].split("/").pop() ?? "";
};

/**
 * DOCU: Converts a file size in bytes to a formatted string in MB with fixed decimals. <br>
 * Triggered: When displaying file size for uploaded or listed materials. <br>
 * Last Updated Date: September 18, 2025
 * 
 */
export function bytesToMB(size_in_bytes: number): string {
	const size_in_mb = size_in_bytes / BYTES_PER_MB;
	return `${size_in_mb.toFixed(DECIMALS)} MB`;
}

/**
 * DOCU: Formats the notification time to a human-readable format. <br>
 * Triggered: When displaying notification time. <br>
 * Last Updated Date: September 29, 2025
 * 
 */
export const formatNotificationTime = (date_created: string): string => {
	const date_time_now = new Date();
	const date_time_created = new Date(date_created);

	/* Calculate difference in milliseconds */
	const difference_in_milliseconds = date_time_now.getTime() - date_time_created.getTime();

	/* Convert to different units */
	const difference_in_minutes = Math.floor(difference_in_milliseconds / MILLISECONDS_PER_MINUTE);
	const difference_in_hours = Math.floor(difference_in_minutes / MINUTES_PER_HOUR);
	const difference_in_days = Math.floor(difference_in_hours / HOURS_PER_DAY);

	/* return 0-59 minutes */
	if (difference_in_minutes < MINUTES_PER_HOUR) {
		return `${difference_in_minutes} ${difference_in_minutes === ONE ? "min ago" : "mins ago"}`;
	}

	/* return 1-23 hours */
	if (difference_in_hours < HOURS_PER_DAY) {
		return `${difference_in_hours} ${difference_in_hours === ONE ? "hour ago" : "hours ago"}`;
	}

	/* return 1-6 days */
	if (difference_in_days < DAYS_PER_WEEK) {
		return `${difference_in_days} ${difference_in_days === ONE ? "day ago" : "days ago"}`;
	}

	/* return the exact date if more than 6 days or 1 week and more */
	return format(date_time_created, "MMMM dd, yyyy");
};

/**
 * DOCU: Calculate the time difference between two dates. <br>
 * Triggered: When displaying remaining time before next session. <br>
 * Last Updated Date: October 7, 2025
 * 
 */
export const calculateTimeDifference = (date: string) => {
	const date_time_now = new Date();
	const given_date_time = new Date(date);

	const difference_in_milliseconds = given_date_time.getTime() - date_time_now.getTime();

	if (difference_in_milliseconds > ZERO) {
		let difference_in_seconds = Math.floor(difference_in_milliseconds / MILLISECONDS_PER_SECOND);

		const days = Math.floor(difference_in_seconds / SECONDS_PER_DAY);
		difference_in_seconds %= SECONDS_PER_DAY;

		const hours = Math.floor(difference_in_seconds / SECONDS_PER_HOUR);
		difference_in_seconds %= SECONDS_PER_HOUR;

		const minutes = Math.floor(difference_in_seconds / SECONDS_PER_MINUTE);
		const seconds = difference_in_seconds % SECONDS_PER_MINUTE;

		return { days, hours, minutes, seconds };
	}

	return { days: ZERO, hours: ZERO, minutes: ZERO, seconds: ZERO };
};
