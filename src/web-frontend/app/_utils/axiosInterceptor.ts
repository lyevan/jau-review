"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * DOCU: Setup axios interceptor to handle 401 errors globally
 * Automatically logs out user when access token expires or is invalid
 * Last Updated: November 8, 2025
 */
export const setupAxiosInterceptor = () => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If token is already being refreshed, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Auto logout on 401 - token expired or invalid
          console.log("Token expired or invalid - logging out");
          await signOut({
            callbackUrl: "/login",
            redirect: true,
          });
          processQueue(null);
          return Promise.reject(error);
        } catch (err) {
          processQueue(err as Error);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // For other errors, reject normally
      return Promise.reject(error);
    }
  );
};
