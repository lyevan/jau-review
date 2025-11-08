"use client";

/* NEXT */
import { ReactNode } from "react";

/* PLUGINS */
import { ClassValue } from "clsx";

/* STORE */
import { useSidebarStore } from "@/app/_stores/useSidebarStore";

/* UTILITIES */
import { cn } from "@/app/_utils";

interface Props {
  children: ReactNode;
  className?: ClassValue;
}

const Main = ({ children, className }: Props) => {
  const is_sidebar_open = useSidebarStore((state) => state.is_sidebar_open);

  return (
    <main
      className={cn(
        "duration-500 w-full md:pl-[56px] min-h-dvh flex flex-col",
        {
          ["md:pl-[200px]"]: is_sidebar_open,
        },
        className
      )}
    >
      {children}
    </main>
  );
};

export default Main;
