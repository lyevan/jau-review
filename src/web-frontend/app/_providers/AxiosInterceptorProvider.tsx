"use client";

import { useEffect } from "react";
import { setupAxiosInterceptor } from "@/app/_utils/axiosInterceptor";

/**
 * DOCU: Component that sets up axios interceptors for automatic token expiration handling
 * This should be rendered once at the app root level
 * Last Updated: November 8, 2025
 */
export default function AxiosInterceptorProvider() {
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  return null;
}
