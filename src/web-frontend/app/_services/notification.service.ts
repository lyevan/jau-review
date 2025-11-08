/* PLUGINS */
import APIClient from "@/app/_utils/apiClient";

/* ENTITIES */
import { ResponseData } from "@/app/_entities/interface/api.interface";

/* CONSTANTS */
import { ONE } from "@/app/_constants";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

class NotificationService extends APIClient {
  constructor() {
    super("/notifications");
  }

  /**
   * DOCU: Fetches all notifications for the current user. <br>
   * Triggered: When notifications are displayed. <br>
   * Last Updated Date: October 27, 2025
   * @param {object} params - Query parameters
   * @returns {Promise<Notification[]>} - Array of notifications
   */
  getNotifications = (params?: { page?: number }) => {
    const queryParams = params?.page ? { params: { page: params.page } } : {};
    return this.get<Notification[]>("/", queryParams)
      .then((res) => {
        if (!res.status) {
          throw res.error;
        }
        return res.result || [];
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * DOCU: Marks a notification as read. <br>
   * Triggered: When user clicks on a notification. <br>
   * Last Updated Date: October 27, 2025
   * @param {string} id - Notification ID
   * @returns {Promise<ResponseData<Notification>>} - Response data containing updated notification
   */
  markAsRead = async (id: string): Promise<ResponseData<Notification>> => {
    return this.put(`/${id}/read`);
  };

  /**
   * DOCU: Marks all notifications as read. <br>
   * Triggered: When user marks all notifications as read. <br>
   * Last Updated Date: October 27, 2025
   * @returns {Promise<ResponseData<Notification[]>>} - Response data containing updated notifications
   */
  markAllAsRead = async (): Promise<ResponseData<Notification[]>> => {
    return this.put("/read-all");
  };

  /**
   * DOCU: Deletes a notification. <br>
   * Triggered: When user deletes a notification. <br>
   * Last Updated Date: October 27, 2025
   * @param {string} id - Notification ID
   * @returns {Promise<ResponseData<void>>} - Response data
   */
  deleteNotification = async (id: string): Promise<ResponseData<void>> => {
    return this.delete(`/${id}`);
  };
}

export default NotificationService;
