/* REACT */
import Header from "@/app/_layouts/Header";
import React, { PropsWithChildren } from "react";
import DoctorSideBar from "./_components/DoctorSideBar";
import Main from "@/app/_layouts/Main";
/* COMPONENTS */

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <DoctorSideBar />

      <Main>
        <Header />

        <div className="flex-1 flex flex-col">{children}</div>
      </Main>
    </>
  );
};

export default Layout;
