/* REACT */
import React, { PropsWithChildren } from "react";

/* COMPONENTS */
import Header from "@/app/_layouts/Header";
import Main from "@/app/_layouts/Main";
import AdminSideBar from "@/app/(pages)/admin/_components/AdminSideBar";
import ProtectedRoute from "@/app/_components/ProtectedRoute";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <AdminSideBar />
      <Main>
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
      </Main>
    </ProtectedRoute>
  );
};

export default Layout;
