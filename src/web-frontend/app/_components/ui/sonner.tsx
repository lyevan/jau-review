"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
          title: "text-gray-900 dark:text-gray-100 font-semibold",
          description: "text-gray-600 dark:text-gray-400",
          actionButton: "bg-teal-600 text-white hover:bg-teal-700",
          cancelButton: "bg-gray-200 text-gray-900 hover:bg-gray-300",
          closeButton:
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700",
          error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
          success:
            "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
          warning:
            "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
          info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
