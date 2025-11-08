import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { AccountType } from "@/app/_entities/enums/auth.enum";

const public_pages = ["/", "/home", "/login", "/forgot-password", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });
  const response = NextResponse.next();

  console.log(
    "🔍 Middleware:",
    pathname,
    "| Token:",
    !!token,
    "| Role:",
    token?.role
  );

  // Allow NextAuth and API routes to run normally
  if (pathname.startsWith("/api/")) {
    console.log("   ✅ Allowing API route");
    return response;
  }

  // No token - redirect to home unless on public page
  if (!token) {
    if (public_pages.includes(pathname)) {
      console.log("   ✅ Allowing public page");
      return response;
    }
    console.log("   ❌ No token, redirect to /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Has token - prevent access to auth pages
  if (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/register"
  ) {
    console.log("   🔄 Logged in, redirecting from auth page");
    const user_role = token.role as AccountType;

    // Redirect to appropriate dashboard based on role
    switch (user_role) {
      case AccountType.SuperAdmin:
      case AccountType.Admin:
        return NextResponse.redirect(new URL("/admin", request.url));
      case AccountType.Doctor:
        return NextResponse.redirect(new URL("/doctor", request.url));
      case AccountType.Staff:
        return NextResponse.redirect(new URL("/staff", request.url));
      case AccountType.Patient:
      default:
        return NextResponse.redirect(new URL("/patient", request.url));
    }
  }

  const user_role = token.role as AccountType;

  // Role-based access control
  switch (user_role) {
    case AccountType.SuperAdmin:
    case AccountType.Admin:
      // Admins can only access /admin/* and /notifications
      if (
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/notifications")
      ) {
        console.log("   🔄 Admin redirecting to /admin");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      break;

    case AccountType.Doctor:
      // Doctors can only access /doctor/* and /notifications
      if (
        !pathname.startsWith("/doctor") &&
        !pathname.startsWith("/notifications")
      ) {
        console.log("   🔄 Doctor redirecting to /doctor");
        return NextResponse.redirect(new URL("/doctor", request.url));
      }
      break;

    case AccountType.Staff:
      // Staff can only access /staff/* and /notifications
      if (
        !pathname.startsWith("/staff") &&
        !pathname.startsWith("/notifications")
      ) {
        console.log("   🔄 Staff redirecting to /staff");
        return NextResponse.redirect(new URL("/staff", request.url));
      }
      break;

    case AccountType.Patient:
      // Patients can only access /patient/* and /notifications
      if (
        !pathname.startsWith("/patient") &&
        !pathname.startsWith("/notifications")
      ) {
        console.log("   🔄 Patient redirecting to /patient");
        return NextResponse.redirect(new URL("/patient", request.url));
      }
      break;

    default:
      console.log("   ❌ Unknown role, redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow all other routes for now
  console.log("   ✅ Allowing authenticated access");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
