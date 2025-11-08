import { Access } from "@/app/_entities/enums/user.enum";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    client_name: string;
    client_id: string;
    access: Access;
    email: string;
    added_by: string;
    date_added: string;
}

/**
 * Used by:
 * Last Updated: September 11, 2025
 * 
 */
export interface GetUserParams {
    course_name_slug?: string;
    client_id?: string;
    access: Access | null;
    sort_by_field: string | null;
    sort_by_order: string | null;
	page?: number;
}