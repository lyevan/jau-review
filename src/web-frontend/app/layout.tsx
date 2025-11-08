/* REACT */
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
/* PLUGINS */
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
/* COMPONENTS */
import Providers from "@/app/_providers";
import { Toaster } from "@/app/_components/ui/sonner";
/* CSS */
import "@/app/_styles/globals.css";
import "overlayscrollbars/overlayscrollbars.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JAU Clinic",
  description: "JAU Clinic Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable}`}>
        <Providers>
          {children}
          <Toaster />
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        </Providers>
      </body>
    </html>
  );
}
