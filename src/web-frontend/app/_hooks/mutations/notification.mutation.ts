/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* SERVICE */
import NotificationService from "@/app/_services/notification.service";

/* CONSTANTS */
import {
  CACHE_KEY_NOTIFICATIONS,
  CACHE_KEY_POPOVER_NOTIFICATIONS,
} from "@/app/_constants/cache_keys";

/* HOOKS */
import {
  updateBulkDataQuery,
  updateDataQuery,
  updateInfiniteBulkDataQuery,
  updateInfiniteDataQuery,
} from "@/app/_hooks/set_query.hook";

const notificationService = new NotificationService();
/**
 * DOCU: Will update the read status of a notification.
 * Triggered: When notification is clicked and when link is clicked.
 * Last Updated: September 30, 2025
 *
 */
export const useUpdateNotificationAsRead = () => {
  const queryClient = useQueryClient();

  const { mutate: updateNotificationAsRead, ...rest } = useMutation({
    mutationFn: (notification_id: string) =>
      notificationService.markAsRead(notification_id),
    onSuccess: (data) => {
      if (data) {
        updateInfiniteDataQuery(
          queryClient,
          [...CACHE_KEY_NOTIFICATIONS],
          data
        );
        updateDataQuery(
          queryClient,
          [...CACHE_KEY_POPOVER_NOTIFICATIONS],
          data
        );

        queryClient.invalidateQueries({
          type: "all",
          refetchType: "none",
        });
      }
    },
  });

  return { updateNotificationAsRead, ...rest };
};

/**
 * DOCU: Will update the read status of all notifications.
 * Triggered: When mark all as read button is clicked.
 * Last Updated: September 30, 2025
 *
 */
export const useUpdateAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  const { mutate: updateAllNotificationsAsRead, ...rest } = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: (data) => {
      if (data) {
        updateInfiniteBulkDataQuery(
          queryClient,
          [...CACHE_KEY_NOTIFICATIONS],
          data
        );
        updateBulkDataQuery(
          queryClient,
          [...CACHE_KEY_POPOVER_NOTIFICATIONS],
          data
        );

        queryClient.invalidateQueries({
          type: "all",
          refetchType: "none",
        });
      }
    },
  });

  return { updateAllNotificationsAsRead, ...rest };
};
