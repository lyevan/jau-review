/* CONSTANTS */
import { ONE, STALE_TIME } from "@/app/_constants";
import { CACHE_KEY_USERS } from "@/app/_constants/cache_keys";

/* ENTITIES */
import { GetUserParams } from "@/app/_entities/interface/user.interface";

/* SERVICE */
import UserService from "@/app/_services/user.service";

/* PLUGINS */
import { useInfiniteQuery } from "@tanstack/react-query";

const userService = new UserService();

/**
 * DOCU: Fetches a list of users with optional filtering and sorting. <br>
 * Triggered: When a component needs to display a list of users. <br>
 * Last Updated: August 29, 2025
 * 
 */
export const useGetUsers = (params: GetUserParams) => {
    const { data: users, ...rest } = useInfiniteQuery({
        queryKey: [...CACHE_KEY_USERS, params],
        queryFn: ({ pageParam = ONE }) => userService.getUsers({ ...params, page: pageParam }),
        staleTime: STALE_TIME,
        placeholderData: (previousData) => previousData,
        initialPageParam: ONE,
        getNextPageParam: (last_page, all_pages) => {
            return last_page && last_page.length ? all_pages.length + ONE : undefined;
        },
    });

    return { users: users?.pages.flat(), ...rest };
};