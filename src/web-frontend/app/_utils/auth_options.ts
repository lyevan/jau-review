/* PLUGINS */
import { jwtDecode } from "jwt-decode";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import pMemoize from "p-memoize";
/* UTILITIES */
import { formatErrorMessage } from "@/app/_utils";
/* SERVICES */
import AuthService from "@/app/_services/auth.service";
/* CONSTANTS */
import { SECONDS_PER_MONTH } from "@/app/_constants";
/* ENTITIES */
import {
  DecodedJWT,
  LoginResponse,
} from "@/app/_entities/interface/auth.interface";
import { ResponseData } from "../_entities/interface/api.interface";

const authService = new AuthService("/auth");

/**
 * DOCU: Memoized function to fix the problem of api racing condition and only use the first call if the same api call.
 * Checks the validity of access token and refreshes tokens and returns new set of tokens if old token is not valid.
 * @param access_token - The current access token to be validated
 * @param refresh_token - The current refresh token used for obtaining new tokens
 * @returns {Promise<{
 *   access_token: string,
 *   refresh_token: string,
 *   access_token_expiration: number,
 *   refresh_token_expiration: number
 * } | undefined>} Returns new token information if refresh was needed and successful, undefined otherwise
 */
export const memRefreshToken = pMemoize(
  async (access_token: string, refresh_token: string) => {
    const is_access_token_valid = await authService.checkAccessTokenValidity(
      access_token,
      refresh_token
    );

    /* Check the token if it is really not valid by using the backend api endpoint checker  */
    if (!is_access_token_valid) {
      const response = await authService.refreshTokens(refresh_token);

      /* Return the new set of tokens when response is successful */
      if (response.result && response.result.new_auth) {
        const decoded_access_token: DecodedJWT = jwtDecode(
          response.result.new_auth.access_token
        );
        const decoded_refresh_token: Pick<DecodedJWT, "id" | "exp" | "iat"> =
          jwtDecode(response.result.new_auth.refresh_token);
        return {
          access_token: response.result.new_auth.access_token,
          refresh_token: response.result.new_auth.refresh_token,
          access_token_expiration: decoded_access_token.exp,
          refresh_token_expiration: decoded_refresh_token.exp,
        };
      }
    }
  }
);

export const auth_options: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email_address: {},
        password: {},
      },
      async authorize(credentials) {
        let response = {} as ResponseData<LoginResponse>;

        try {
          response = await authService.loginUser(credentials);
          if (response.error) {
            throw response.error;
          }
        } catch (error) {
          throw new Error(formatErrorMessage(error));
        }

        if (!response || !response?.result?.access_token) {
          return null;
        }

        const decoded_access_token: DecodedJWT = jwtDecode(
          response.result.access_token
        );
        const decoded_refresh_token: Pick<DecodedJWT, "id" | "exp" | "iat"> =
          jwtDecode(response.result.refresh_token);

        return {
          id: decoded_access_token.id.toString(),
          email: decoded_access_token.email,
          access_token: response.result.access_token,
          refresh_token: response.result.refresh_token,
          access_token_expiration: decoded_access_token.exp,
          refresh_token_expiration: decoded_refresh_token.exp,
          role: decoded_access_token.role,
          first_name: decoded_access_token.first_name,
          last_name: decoded_access_token.last_name,
          username: decoded_access_token.username,
          contact_number: decoded_access_token.contact_number,
          date_of_birth: decoded_access_token.date_of_birth,
          gender: decoded_access_token.gender,
          profile_picture: decoded_access_token.profile_picture,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.access_token_expiration = user.access_token_expiration;
        token.refresh_token_expiration = user.refresh_token_expiration;
        token.role = user.role;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.username = user.username;
        token.contact_number = user.contact_number;
        token.date_of_birth = user.date_of_birth;
        token.gender = user.gender;
        token.profile_picture = user.profile_picture;
      }

      /*
       * TODO: Uncomment this when real BE API is available
       * if (Date.now() > token.access_token_expiration * THOUSAND) {
       *   const response = await memRefreshToken(token.access_token, token.refresh_token);
       *
       *   if (response && response.access_token && response.refresh_token) {
       *     token.access_token = response.access_token;
       *     token.refresh_token = response.refresh_token;
       *     token.access_token_expiration = response.access_token_expiration;
       *     token.refresh_token_expiration = response.refresh_token_expiration;
       *   }
       * }
       */

      if (trigger === "update" && session.data.user) {
        token.first_name = session.data.user.first_name;
        token.last_name = session.data.user.last_name;
        token.email = session.data.user.email;
        token.username = session.data.user.username;
        token.contact_number = session.data.user.contact_number;
        token.date_of_birth = session.data.user.date_of_birth;
        token.gender = session.data.user.gender;
        token.profile_picture = session.data.user.profile_picture;

        return { ...token };
      }

      return { ...token } as JWT;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.access_token = token.access_token;
        session.user.refresh_token = token.refresh_token;
        session.user.role = token.role;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.username = token.username;
        session.user.contact_number = token.contact_number;
        session.user.date_of_birth = token.date_of_birth;
        session.user.gender = token.gender;
        session.user.profile_picture = token.profile_picture;
      }

      return session;
    },
  },
  events: {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    signOut: ({ token }) => {
      /*
       * TODO: Uncomment this when real BE API is available
       * This will invalidate user refresh tokens every sign out.
       * await authService.invalidateToken(token.access_token, token.refresh_token);
       */
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SECONDS_PER_MONTH,
  },
  debug: process.env.NODE_ENV !== "production",
};
