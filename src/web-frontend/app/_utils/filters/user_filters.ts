/* PLUGINS */
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const UserFilters = {
	search: parseAsString,
};

export const UserSearchParamsCache = createSearchParamsCache(UserFilters);
