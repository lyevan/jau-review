"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HomePage from "./(pages)/home/page";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Redirect authenticated users to their appropriate dashboard
      const role = session.user.role;
      if (role === "admin" || role === "superadmin") {
        router.push("/admin");
      } else if (role === "doctor") {
        router.push("/doctor");
      } else if (role === "staff") {
        router.push("/staff");
      } else if (role === "patient") {
        router.push("/patient");
      }
    }
  }, [session, status, router]);

  // Show home page for unauthenticated users
  return <HomePage />;
}
