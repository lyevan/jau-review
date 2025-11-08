/* PLUGINS */
import { dehydrate, QueryClient } from "@tanstack/react-query";

/**
 * DOCU: This function prefetches notifications data for SSR.
 * Triggered: Being used by the notifications page.
 * Last Updated Date: October 27, 2025
 * @returns {Promise<any>} - Dehydrated state for React Query
 */
export const prefetchNotifications = async () => {
  const queryClient = new QueryClient();

  // TODO: Implement notification prefetching when notification service is available
  // await queryClient.prefetchQuery({
  //     queryKey: ["notifications"],
  //     queryFn: () => notificationService.getNotifications(),
  // });

  return dehydrate(queryClient);
};
