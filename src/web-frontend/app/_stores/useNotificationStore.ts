/* PLUGINS */
import { create } from "zustand";

/* UTILITIES */
import { createSelectors } from "@/app/_utils";

interface NotificationStore {
	is_mark_all_as_read_disabled: boolean;
	setIsMarkAllAsReadDisabled: (is_mark_as_read_disabled: boolean) => void;
}

const useNotificationStore = create<NotificationStore>()((set) => ({
	is_mark_all_as_read_disabled: false,
	setIsMarkAllAsReadDisabled: (is_mark_all_as_read_disabled) => set({ is_mark_all_as_read_disabled }),
}));

export default createSelectors(useNotificationStore);
