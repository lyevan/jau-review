import { create } from "zustand";

interface SidebarStore {
	is_sidebar_open: boolean;
	setOpenSidebar: (is_sidebar_open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
	is_sidebar_open: true,
	setOpenSidebar: (is_sidebar_open) => set({ is_sidebar_open }),
}));
