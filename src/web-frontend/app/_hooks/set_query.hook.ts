/* PLUGINS */
import { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";

/* CONSTANS */
import { ONE, ZERO } from "@/app/_constants";

/* ENTITIES */
import { PaginatedResult } from "@/app/_entities/interface/api.interface";

/**
 * DOCU: Will remove the data from useInfiniteQuery. <br>
 * Triggered: When delete is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be removed.
 * @param {string} id - The id of the data to be removed.
 * @param {keyof T} item_key - The key of the data to be removed. Defaults to "id".
 */
export const removeInfiniteDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, id: string | number, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<InfiniteData<T[]> | undefined>(keys, (data) => {
		if (data) {
			const updated_pages = data?.pages.map((page) => {
				const updated_page = page.filter((data) => data[item_key] !== id);
				return updated_page;
			});

			return {
				pages: updated_pages,
				pageParams: data.pageParams,
			};
		}
	});
};

/**
 * DOCU: Will update the data in useInfiniteQuery. <br>
 * Triggered: When update is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be updated.
 * @param {T} updated_data - The updated data.
 */
export const updateInfiniteDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, updated_data: Partial<T>, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<InfiniteData<T[]> | undefined>(keys, (data) => {
		if (data) {
			const updated_pages = data?.pages.map((page) => {
				const updated_page = page.map((item) => {
					if (item[item_key] === updated_data[item_key]) {
						return { ...item, ...updated_data };
					}
					return item;
				});

				return updated_page;
			});

			return {
				pages: updated_pages,
				pageParams: data.pageParams,
			};
		}
	});
};

/**
 * DOCU: Will update the data in useInfiniteQuery. <br>
 * Triggered: When update is triggered. <br>
 * Last Updated Date: September 30, 2025
 * 
 */
export const updateInfiniteBulkDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, updated_data: Partial<T> | Partial<T>[], item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<InfiniteData<T[]> | undefined>(keys, (data) => {
		if (data) {
			const updated_items = Array.isArray(updated_data) ? updated_data : [updated_data];
			const updated_items_per_page = new Map(updated_items.map((updated_item) => [updated_item[item_key], updated_item]));
			const updated_pages = data?.pages.map((page) =>
				page.map((item) => {
					if (updated_items_per_page.has(item[item_key])) {
						return { ...item, ...updated_items_per_page.get(item[item_key]) };
					}
					return item;
				}),
			);
			return {
				pages: updated_pages,
				pageParams: data.pageParams,
			};
		}
	});
};

/**
 * DOCU: Will add data in useInfiniteQuery. <br>
 * Triggered: When add is triggered. <br>
 * Last Updated Date: August 27, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be added.
 * @param {T | T[]} new_data - The new data to be added.
 */
export const addInfiniteDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, new_data: T | T[]) => {
	queryClient.setQueryData<InfiniteData<T[]> | undefined>(keys, (data) => {
		if (data && data.pages[ZERO]) {
			const new_items = Array.isArray(new_data) ? new_data : [new_data];

			const updated_pages = [[...new_items, ...data.pages[ZERO]], ...data.pages.slice(ONE)];

			return {
				...data,
				pages: updated_pages,
			};
		}

		return data;
	});
};

/**
 * DOCU: Will remove data in useQuery. <br>
 * Triggered: When delete is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be removed.
 * @param {string} id - The id of the data to be removed.
 * @param {keyof T} item_key - The key of the data to be removed. Defaults to "id".
 */
export const removeDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, id: string, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<T[]>(keys, (data) => {
		if (data) {
			return data.filter((item) => item[item_key] !== id);
		}
		return data;
	});
};

/**
 * DOCU: Will add data in useQuery. <br>
 * Triggered: When add is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be added.
 * @param {T} new_data - The new data to be added.
 */
export const addDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, new_data: T) => {
	queryClient.setQueryData<T[]>(keys, (data) => {
		return [new_data, ...(data ?? [])];
	});
};

/**
 * DOCU: Will update data in useQuery. <br>
 * Triggered: When update is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be updated.
 * @param {T} updated_data - The updated data.
 * @param {keyof T} item_key - The key of the data to be updated. Defaults to "id".
 */
export const updateDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, updated_data: T, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<T[]>(keys, (data) => {
		if (data) {
			return data.map((item) => (item[item_key] === updated_data[item_key] ? { ...item, ...updated_data } : item));
		}
	});
};

/**
 * DOCU: Will update data in useQuery. <br>
 * Triggered: When update is triggered. <br>
 * Last Updated Date: October 1, 2025
 * 
 */
export const updateBulkDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, updated_data: T | T[], item_key: keyof T = "id" as keyof T) => {
    queryClient.setQueryData<T[]>(keys, (data) => {
        if (data) {
            const updated_items = Array.isArray(updated_data) ? updated_data : [updated_data];
            const updated_items_map = new Map(updated_items.map((updated_item) => [updated_item[item_key], updated_item]));

            return data.map((item) => {
                if (updated_items_map.has(item[item_key])) {
                    return { ...item, ...updated_items_map.get(item[item_key]) };
                }
                return item;
            });
        }
    });
}

/**
 * DOCU: Will add data to usePaginatedQuery. <br>
 * Triggered: When add is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be added.
 * @param {T} new_data - The new data to be added.
 */
export const addPaginatedDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, new_data: T) => {
	queryClient.setQueryData<PaginatedResult<T[]>>(keys, (data) => {
		if (data) {
			return {
				data: [new_data, ...data.data],
				total_count: (data.total_count ?? ZERO) + ONE,
			};
		}

		return data;
	});
};

/**
 * DOCU: Will update data in usePaginatedQuery. <br>
 * Triggered: When update is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be updated.
 * @param {T} updated_data - The updated data.
 * @param {keyof T} item_key - The key of the data to be updated. Defaults to "id".
 */
export const updatePaginatedDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, updated_data: T, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<PaginatedResult<T[]>>(keys, (data) => {
		if (data) {
			const updated_mapped_data = data.data.map((item) => (item[item_key] === updated_data[item_key] ? { ...item, ...updated_data } : item));

			return {
				...data,
				data: updated_mapped_data,
			};
		}

		return data;
	});
};

/**
 * DOCU: Will remove data in usePaginatedQuery. <br>
 * Triggered: When delete is triggered. <br>
 * Last Updated Date: August 25, 2025
 * 
 * @param {QueryClient} queryClient - The QueryClient instance.
 * @param {QueryKey} keys - The unique key of the data to be removed.
 * @param {number} id - The id of the data to be removed.
 * @param {keyof T} item_key - The key of the data to be removed. Defaults to "id".
 */
export const removePaginatedDataQuery = <T>(queryClient: QueryClient, keys: QueryKey, id: number, item_key: keyof T = "id" as keyof T) => {
	queryClient.setQueryData<PaginatedResult<T[]>>(keys, (data) => {
		if (data) {
			return {
				data: data.data.filter((item) => item[item_key] !== id),
				total_count: (data.total_count ?? ONE) - ONE,
			};
		}

		return data;
	});
};
