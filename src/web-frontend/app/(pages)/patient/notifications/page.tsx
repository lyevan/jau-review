/* COMPONENTS */
import NotificationPageContainer from "@/app/_components/NotificationPageContainer";

/* PREFETCH */
import { prefetchNotifications } from "@/app/_prefetch/notification.prefetch";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

const NotificationPage = async () => {
	const prefetched_notifications = await prefetchNotifications();
	return (
		<HydrationBoundary state={prefetched_notifications}>
			<NotificationPageContainer />
		</HydrationBoundary>
	);
};

export default NotificationPage;
