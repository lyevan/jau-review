/* ENTITIES */
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { AccountType } from "@/app/_entities/enums/auth.enum";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      access_token: string;
      refresh_token: string;
      access_token_expiration: number;
      refresh_token_expiration: number;
      role: AccountType;
      first_name?: string;
      last_name?: string;
      username?: string;
      contact_number?: string;
      date_of_birth?: string;
      gender?: "male" | "female" | "other";
      profile_picture?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    access_token: string;
    refresh_token: string;
    access_token_expiration: number;
    refresh_token_expiration: number;
    role: AccountType;
    first_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    profile_picture?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    access_token: string;
    refresh_token: string;
    access_token_expiration: number;
    refresh_token_expiration: number;
    role: AccountType;
    first_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    profile_picture?: string;
  }
}

export interface DecodedJWT {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  contact_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  profile_picture?: string;
  role: AccountType;
  exp: number;
  iat: number;
  jti: string;
}

export interface LoginResponse {
  access_token: "test_access_token";
  refresh_token: "test_refresh_token";
}
