/* PLUGINS */
import NextAuth from "next-auth";
/* UTILITIES */
import { auth_options } from "@/app/_utils/auth_options";

const handler = NextAuth(auth_options);

export { handler as GET, handler as POST };
