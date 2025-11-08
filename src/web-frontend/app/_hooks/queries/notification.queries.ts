/* CONSTANTS */
import { ONE, STALE_TIME } from "@/app/_constants";
import { CACHE_KEY_NOTIFICATIONS, CACHE_KEY_POPOVER_NOTIFICATIONS } from "@/app/_constants/cache_keys";

/* SERVICE */
import NotificationService from "@/app/_services/notification.service";

/* PLUGINS */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const notificationService = new NotificationService();

/**
 * DOCU: Will get all notifications. <br>
 * Triggered: On load of notifications list. <br>
 * Last Updated: September 26, 2025
 * 
 */
export const useGetNotifications = () => {
	const { data: notifications, ...rest } = useInfiniteQuery({
		queryKey: [...CACHE_KEY_NOTIFICATIONS],
		queryFn: ({ pageParam = ONE }) => notificationService.getNotifications({ page: pageParam }),
		staleTime: STALE_TIME,
		placeholderData: (previous_data) => previous_data,
		initialPageParam: ONE,
		getNextPageParam: (last_page, all_pages) => {
			return last_page && last_page.length ? all_pages.length + ONE : undefined;
		},
	});
	return { notifications: notifications?.pages.flat(), ...rest };
};

export const useGetPopoverNotifications = () => {
    const { data: notifications, ...rest } = useQuery({
        queryKey: [...CACHE_KEY_POPOVER_NOTIFICATIONS],
        queryFn: () => notificationService.getNotifications({ page: ONE }),
        staleTime: STALE_TIME,
    });

    return { notifications, ...rest };
}


