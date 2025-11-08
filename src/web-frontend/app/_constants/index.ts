/* eslint-disable no-magic-numbers */


export const NEGATIVE_ONE = -1;
export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const THREE = 3;
export const FOUR = 4;
export const FIVE = 5;
export const SIX = 6;
export const EIGHT = 8;
export const TEN = 10;
export const ONE_WEEK = 7;
export const HUNDRED = 100;
export const SECONDS_PER_MONTH = 2592000;
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_MINUTE = 60;
export const MILLISECONDS_PER_SECOND = 1000;
export const MILLISECONDS_PER_MINUTE = 60000;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const THOUSAND = 1000;
export const INVALID_SESSION_TOKEN = "INVALID_SESSION_TOKEN";
export const USER_NOT_PERMITTED_ERROR = "USER_NOT_PERMITTED_ERROR";
export const SIGNOUT_ERROR = "SIGNOUT_ERROR";
export const MAX_FILE_SIZE = 25 * 1024 * 1024; /* 25 MB */
export const STALE_TIME = 60000 * 5; /* 5 Minutes */
export const CALENDAR_TOTAL_DAYS = 34;
export const LOCAL_STORAGE_KEY = "FORGOT_PASSWORD_TIMESTAMP";
export const LOCAL_STORAGE_SUBMITTED_KEY = "FORGOT_PASSWORD_SUBMITTED";
export const LOCAL_STORAGE_EMAIL = "LOCAL_STORAGE_EMAIL";
export const SECONDS_TO_RESEND = 30;

export const MAX_FILE_SIZE_MB = 25;
export const MAX_VISIBLE_MATERIALS = 2;
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
export const DECIMALS = 2;
export const PROGRESS_MIN = 0;
export const PROGRESS_MAX = 100;
export const PROGRESS_START = 10;
export const PROGRESS_UPLOAD = 30;
export const PROGRESS_END = 100;
export const PROGRESS_CHUNK = 80;
export const PROGRESS_RESET_DELAY = 500;
export const MAX_CHARS = 250;
export const ITEM_PER_PAGE = 30;

export const RATING_SCALE = Array.from({ length: TEN }, (_, i) => i + ONE);
export const RATING_LABELS: Record<number, string> = {
	1: "Very Poor",
	2: "Poor",
	3: "Below Average",
	4: "Fair",
	5: "Average",
	6: "Above Average",
	7: "Good",
	8: "Very Good",
	9: "Excellent",
	10: "Outstanding",
};

export const TIMEOUT_SPEED = {
	slowest: 5000,
	slower: 3000,
	slow: 2000,
	normal: 1000,
	fast: 500,
	faster: 350,
	fastest: 150,
} as const;

export const REGEX = {
	phone_number_formatted: /^\(\d{3}\) \d{3}-\d{4}$/,
	zoom_link: /^https?:\/\/([a-z0-9-]+\.)*zoom\.us\/(j|s|my)\/[A-Za-z0-9]+(?:\?.*)?$/i,
} as const;

export const CALENDAR_TIMELINE = [
	{
		key: 8,
		label: "8AM",
	},
	{
		key: 9,
		label: "9AM",
	},
	{
		key: 10,
		label: "10AM",
	},
	{
		key: 11,
		label: "11AM",
	},
	{
		key: 12,
		label: "12PM",
	},
	{
		key: 13,
		label: "1PM",
	},
	{
		key: 14,
		label: "2PM",
	},
	{
		key: 15,
		label: "3PM",
	},
	{
		key: 16,
		label: "4PM",
	},
	{
		key: 17,
		label: "5PM",
	},
	{
		key: 18,
		label: "6PM",
	},
	{
		key: 19,
		label: "7PM",
	},
	{
		key: 20,
		label: "8PM",
	},
	{
		key: 21,
		label: "9PM",
	},
	{
		key: 22,
		label: "10PM",
	},
	{
		key: 23,
		label: "11PM",
	},
	{
		key: 24,
		label: "12AM",
	},
];

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

