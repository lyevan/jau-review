/* PLUGINS */
import { create } from "zustand";
/* UTILITIES */
import { createSelectors } from "@/app/_utils";

interface UserStore {
	is_add_user_modal_open: boolean;
	setAddUserModal: (is_add_user_modal_open: boolean) => void;

    highlighted_user_ids: number[] | null;
    setHighlightedUsers: (highlighted_user: number[] | null) => void;

    user_deleting_id: number | null;
    setUserDeletingId: (user_deleting_id: number | null) => void;

}

const useUserStore = create<UserStore>()((set) => ({
	is_add_user_modal_open: false,
	setAddUserModal: (is_add_user_modal_open) => set({ is_add_user_modal_open }),

    highlighted_user_ids: null,
    setHighlightedUsers: (highlighted_user_ids) => set({ highlighted_user_ids }),

    user_deleting_id: null,
    setUserDeletingId: (user_deleting_id) => set({ user_deleting_id }),
}));

export default createSelectors(useUserStore);
