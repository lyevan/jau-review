/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth";
import { getSession, signOut } from "next-auth/react";
/* CONSTANTS */
import { SIGNOUT_ERROR } from "@/app/_constants";
/* UTILITIES */
import { throwAuthenticationError } from "@/app/_utils";
import { auth_options } from "@/app/_utils/auth_options";
/* ENTITIES */
import { ResponseData } from "@/app/_entities/interface/api.interface";

class APIClient {
  private axios_instance: AxiosInstance;
  endpoint: string;

  constructor(endpoint: string, config?: AxiosRequestConfig) {
    this.endpoint = endpoint;
    this.axios_instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      ...config,
    });

    this.setupRequestInterceptors();
    this.setupResponseInterceptors();
  }

  /**
	 * DOCU: This function will send GET request to the backend API. <br>
	 * Triggered: Being used by all services. <br>
	 * Last Updated Date: September 12, 2024
	 * @param {string} url - Requires the API Url
	 * @returns {Promise<ResponseData<ReturnType>>} - Response data from the API
	 * @template ReturnType - Expected return type of result
\
	 */
  get = async <ReturnType>(url: string, config?: AxiosRequestConfig) => {
    const res = await this.axios_instance.get<ResponseData<ReturnType>>(
      `${this.endpoint}${url}`,
      config
    );
    throwAuthenticationError(res.data.error);
    return res.data;
  };

  /**
   * DOCU: This function will send POST request to the backend API. <br>
   * Triggered: Being used by all services. <br>
   * Last Updated Date: September 12, 2024
   * @param {string} url - Requires the API Url
   * @param {object} params - Optional params to be sent
   * @returns {Promise<ResponseData<ReturnType>>} - Response data from the API
   * @template ReturnType - Expected return type of result
   * @:
   */
  post = async <ReturnType, T = unknown>(
    url?: string,
    params?: T,
    config?: AxiosRequestConfig
  ) => {
    const res = await this.axios_instance.post<ResponseData<ReturnType>>(
      `${this.endpoint}${url}`,
      params,
      config
    );
    throwAuthenticationError(res.data.error);
    return res.data;
  };

  /**
   * DOCU: This function will send PUT request to the backend API. <br>
   * Triggered: Being used by all services. <br>
   * Last Updated Date: September 12, 2024
   * @param {string} url - Requires the API Url
   * @param {object} params - Optional params to be sent
   * @returns {Promise<ResponseData<ReturnType>>} - Response data from the API
   * @template ReturnType - Expected return type of result
   * @:
   */
  put = async <ReturnType, T = unknown>(
    url?: string,
    params?: T,
    config?: AxiosRequestConfig
  ) => {
    const res = await this.axios_instance.put<ResponseData<ReturnType>>(
      `${this.endpoint}${url}`,
      params,
      config
    );
    throwAuthenticationError(res.data.error);
    return res.data;
  };

  /**
   * DOCU: This function will send PATCH request to the backend API. <br>
   * Triggered: Being used by all services. <br>
   * Last Updated Date: October 29, 2025
   * @param {string} url - Requires the API Url
   * @param {object} params - Optional params to be sent
   * @returns {Promise<ResponseData<ReturnType>>} - Response data from the API
   * @template ReturnType - Expected return type of result
   * @:
   */
  patch = async <ReturnType, T = unknown>(
    url?: string,
    params?: T,
    config?: AxiosRequestConfig
  ) => {
    const res = await this.axios_instance.patch<ResponseData<ReturnType>>(
      `${this.endpoint}${url}`,
      params,
      config
    );
    throwAuthenticationError(res.data.error);
    return res.data;
  };

  /**
   * DOCU: This function will send DELETE request to the backend API. <br>
   * Triggered: Being used by all services. <br>
   * Last Updated Date: May 02, 2024
   * @param {string} url - Requires the API Url
   * @returns {Promise<ResponseData<ReturnType>>} - Response data from the API
   * @template ReturnType - Expected return type of result
   * @:
   */
  delete = async <ReturnType>(url?: string, config?: AxiosRequestConfig) => {
    const res = await this.axios_instance.delete<ResponseData<ReturnType>>(
      `${this.endpoint}${url}`,
      config
    );
    throwAuthenticationError(res.data.error);
    return res.data;
  };

  /**
   * DOCU: This function will setup the request interceptor for the Axios instance. <br>
   * Triggered: Automatically when the Axios instance is created. <br>
   * Last Updated Date: September 12, 2024
   * @returns {void}
   * @:
   */
  private setupRequestInterceptors = () => {
    this.axios_instance.interceptors.request.use(async (request) => {
      /**
       * DOCU: This condition will check if the session exists in the client side. <br>
       * If the session exists, the access token and refresh token will be added to the request headers. <br>
       */
      if (typeof window !== "undefined") {
        const session = await getSession();

        if (
          session &&
          session.user.access_token &&
          session.user.refresh_token
        ) {
          request.headers.Authorization = `Bearer ${session.user.access_token}`;
          request.headers["x-refresh-token"] = session.user.refresh_token;
        }
      } else {
        /**
         * DOCU: This condition will check if the session exists in the server side. <br>
         * If the session exists, the access token and refresh token will be added to the request headers. <br>
         */
        const session = await getServerSession(auth_options);
        if (
          session &&
          session.user.access_token &&
          session.user.refresh_token
        ) {
          request.headers.Authorization = `Bearer ${session.user.access_token}`;
          request.headers["x-refresh-token"] = session.user.refresh_token;
        }
      }

      return request;
    });
  };

  /**
   * DOCU: This function will setup the response interceptor for the Axios instance. <br>
   * Triggered: Automatically when the Axios instance is created. <br>
   * Last Updated Date: September 12, 2024
   * @returns {void}
   * @:
   */
  private setupResponseInterceptors = () => {
    this.axios_instance.interceptors.response.use((response) => {
      /**
       * DOCU: This condition will check if the session exists in the client side. <br>
       * If the session does not exist and the error is USER_AUTHENTICATION_ERROR, the signOut function will be called. <br>
       */
      if (!response.data.status && response.data.error === SIGNOUT_ERROR) {
        if (typeof window !== "undefined") {
          signOut({
            callbackUrl: "/",
          });
        }
      }
      return response;
    });
  };
}

export default APIClient;
