/* REACT */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
/* PLUGINS */
import { getServerSession } from "next-auth";
/* UTILITIES */
import { auth_options } from "@/app/_utils/auth_options";
/* SERVICES */
import AuthService from "@/app/_services/auth.service";

/* eslint-disable @typescript-eslint/no-unused-vars */
const authService = new AuthService("/auth");

export async function GET(request: Request) {
	const cookies_store = await cookies();
	const session = await getServerSession(auth_options);
	const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://");
	const cookiePrefix = secureCookie ? "__Secure-" : "";

	const cookie_names = [
		`${cookiePrefix}next-auth.session-token`,
		`${cookiePrefix}next-auth.callback-url`,
		`${secureCookie ? "__Host-" : ""}next-auth.csrf-token`,
	];

	cookie_names.forEach((cookie_name) =>
		cookies_store.set(cookie_name, "", {
			expires: new Date(Date.now()),
			secure: secureCookie,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
		}),
	);

	/* 
	 * TODO: Uncomment this when real BE API is available
	 * Invalidate the token when user sign out
	 * if (session?.user?.access_token && session?.user?.refresh_token) {
	 *   try {
	 *     await authService.invalidateToken(
	 *       session.user.access_token,
	 *       session.user.refresh_token,
	 *     );
	 *   }
	 *   catch (error) {
	 *     return NextResponse.redirect(new URL(process.env.NEXTAUTH_URL!, request.url));
	 *   }
	 * }
	 */

	return NextResponse.redirect(new URL(process.env.NEXTAUTH_URL!, request.url));
}
