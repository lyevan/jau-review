"use client";
/* REACT */
import { PropsWithChildren } from "react";
/* COMPONENTS */
import QueryClientProvider from "@/app/_providers/QueryClientProvider";
import AxiosInterceptorProvider from "@/app/_providers/AxiosInterceptorProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider } from "next-auth/react";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <AxiosInterceptorProvider />
      <QueryClientProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
