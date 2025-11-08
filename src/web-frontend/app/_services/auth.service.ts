/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
/* ENTITIES */
import { ResponseData, SetNewAuth } from "../_entities/interface/api.interface";
import { LoginResponse } from "@/app/_entities/interface/auth.interface";

class AuthService {
  private axios_instance: AxiosInstance;

  constructor(endpoint: string, config?: AxiosRequestConfig) {
    this.axios_instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL + endpoint,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      ...config,
    });
  }

  /**
   * DOCU: will login user.
   * Triggered: On submit of login form.
   * Last Updated Date: January 15, 2025
   * @param {Object} credentials - { email_address: string, password: string }
   * @returns {Object} - Response data from the API
   */
  loginUser = async (
    credentials: Record<"email_address" | "password", string> | undefined
  ) => {
    const res = await this.axios_instance.post<ResponseData<LoginResponse>>(
      "/signin",
      {
        email_address: credentials?.email_address,
        password: credentials?.password,
      }
    );
    return res.data;
  };

  /**
   * DOCU: will check access token validity.
   * Triggered: On every request to the backend API.
   * Last Updated Date: January 15, 2025
   * @param {string} access_token - Access token
   * @param {string} refresh_token - Refresh token
   * @returns {boolean} - Status of the access token
   *
   */
  checkAccessTokenValidity = async (
    access_token: string,
    refresh_token: string
  ) => {
    const res = await this.axios_instance.get<ResponseData>("/session_check", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        ["x-refresh-token"]: refresh_token,
      },
    });
    return res.data.status;
  };

  /**
   * DOCU: will refresh tokens.
   * Triggered: On expiration of access token.
   * Last Updated Date: January 15, 2025
   * @param {string} refresh_token - Refresh token
   * @returns {Object} - Response data from the API
   *
   */
  refreshTokens = async (refresh_token: string) => {
    const res = await this.axios_instance.post<ResponseData<SetNewAuth>>(
      "/session_refresh",
      {},
      {
        headers: {
          ["x-refresh-token"]: refresh_token,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: will validate user invite.
   * Triggered: On page load of /users/validate_invite
   * Last Updated Date: December 27, 2024
   */
  validateUserInvite = async (
    uuel_id: string | undefined,
    token: string | undefined
  ) => {
    const res = await this.axios_instance.post<ResponseData>(
      "/validate_invite",
      {
        uuel_id,
        token,
      }
    );
    return res.data;
  };

  /**
   * DOCU: will invalidate user tokens.
   * Triggered: On click of logout button.
   * Last Updated Date: January 15, 2025
   * @param {string} access_token - Access token
   * @param {string} refresh_token - Refresh token
   */
  invalidateToken = async (access_token: string, refresh_token: string) => {
    const res = await this.axios_instance.post<ResponseData>(
      "/log_out",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          ["x-refresh-token"]: refresh_token,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: will register new patient user.
   * Triggered: On submit of registration form.
   * Last Updated Date: November 5, 2025
   * @param {Object} data - Registration form data
   * @returns {Object} - Response data from the API
   */
  registerPatient = async (data: {
    full_name: string;
    email: string;
    password: string;
    contact_number?: string;
    address?: string;
    date_of_birth?: string;
    gender?: string;
  }) => {
    const res = await this.axios_instance.post<ResponseData>("/register", data);
    return res.data;
  };
}

export default AuthService;
