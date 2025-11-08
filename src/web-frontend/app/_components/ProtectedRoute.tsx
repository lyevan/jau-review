"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not logged in - redirect to login
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      // Wrong role - redirect to appropriate dashboard
      const roleDashboards: Record<string, string> = {
        admin: "/admin",
        staff: "/staff",
        doctor: "/doctor",
        patient: "/patient",
      };

      router.push(roleDashboards[session.user.role] || "/");
    }
  }, [session, status, router, allowedRoles]);

  // Show loading while checking
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authorized (will redirect)
  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
}
