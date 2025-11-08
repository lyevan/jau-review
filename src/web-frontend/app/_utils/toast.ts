import { toast as sonnerToast } from "sonner";

/**
 * Toast utility using Sonner
 * Provides a consistent toast notification system across the application
 */

export const toast = {
  /**
   * Show a success toast
   * @param message - The message to display
   * @param description - Optional description
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show an error toast
   * @param message - The error message to display
   * @param description - Optional error description
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show an info toast
   * @param message - The info message to display
   * @param description - Optional description
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a warning toast
   * @param message - The warning message to display
   * @param description - Optional description
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a loading toast
   * @param message - The loading message to display
   * @returns The toast ID for dismissing later
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Show a promise toast (automatically handles loading, success, and error states)
   * @param promise - The promise to track
   * @param messages - Messages for loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
