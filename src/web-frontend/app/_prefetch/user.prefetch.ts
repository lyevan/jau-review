
/* PLUGINS */
import { dehydrate } from "@tanstack/react-query";

/* SERVICE */
import UserService from "@/app/_services/user.service";

/* HELPERS */
import getQueryClient from "@/app/_utils/getQueryClient";

/* CONSTANTS */
import { CACHE_KEY_USERS } from "@/app/_constants/cache_keys";
import { ONE } from "@/app/_constants";

const userService = new UserService();

/**
 * DOCU: Prefetches users data for server-side rendering. <br>
 * Triggered: When a page that needs users data is being server-side rendered. <br>
 * Last Updated: September 11, 2025
 * 
 */
export const prefetchUsers = async (client_name_slug?: string) => {
    const queryClient = getQueryClient();

    const params = {
        client_name_slug,
        client_id: "all",
        access: null,
        sort_by_field: null,
        sort_by_order: null,
    }

    await queryClient.prefetchInfiniteQuery({
        queryKey: [...CACHE_KEY_USERS, params],
        queryFn: () => userService.getUsers(params),
        initialPageParam: ONE,
    });

    return await dehydrate(queryClient);
};

