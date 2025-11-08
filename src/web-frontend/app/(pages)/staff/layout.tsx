/* REACT */
import Header from "@/app/_layouts/Header";
import React, { PropsWithChildren } from "react";
import StaffSideBar from "./_components/StaffSideBar";
import Main from "@/app/_layouts/Main";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
/* COMPONENTS */

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <StaffSideBar />

      <Main>
        <Header />

        <div className="flex-1 flex flex-col">{children}</div>
      </Main>
    </ProtectedRoute>
  );
};

export default Layout;
