/* REACT */
import Header from "@/app/_layouts/Header";
import React, { PropsWithChildren } from "react";
import PatientSideBar from "@/app/(pages)/patient/_components/PatientSideBar";
import Main from "@/app/_layouts/Main";

/* COMPONENTS */

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <PatientSideBar />

      <Main>
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
      </Main>
    </>
  );
};

export default Layout;
