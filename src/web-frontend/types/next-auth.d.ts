import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      contact_number?: string;
      date_of_birth?: string;
      gender?: "male" | "female" | "other";
      profile_picture?: string;
      role: string;
      access_token: string;
      refresh_token: string;
      access_token_expiration: number;
      refresh_token_expiration: number;
    };
  }

  interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    profile_picture?: string;
    role: string;
    access_token: string;
    refresh_token: string;
    access_token_expiration: number;
    refresh_token_expiration: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    profile_picture?: string;
    role: string;
    access_token: string;
    refresh_token: string;
    access_token_expiration: number;
    refresh_token_expiration: number;
  }
}
