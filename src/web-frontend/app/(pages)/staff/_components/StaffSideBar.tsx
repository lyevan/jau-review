"use client";

import SvgIcon from "@/app/_components/SvgIcon";
import Sidebar from "@/app/_layouts/SideBar";
import {
  Calendar,
  ChartLine,
  ClipboardClock,
  FileUser,
  LayoutDashboard,
  LucideIcon,
  Pill,
  Receipt,
  ShoppingCart,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";
import { JSX } from "react";

const StaffSideBar = () => {
  const staffMenu: {
    label: string;
    link: string;
    DefaultIcon: LucideIcon;
    ActiveIcon: LucideIcon;
    subMenu?: { label: string; link: string; Icon?: LucideIcon }[];
  }[] = [
    {
      label: "Dashboard",
      link: "/staff",
      DefaultIcon: LayoutDashboard,
      ActiveIcon: LayoutDashboard,
    },
    {
      label: "Patient Records",
      link: "/staff/patient",
      DefaultIcon: FileUser,
      ActiveIcon: FileUser,
    },
    {
      label: "Appointments",
      link: "/staff/appointment",
      DefaultIcon: ClipboardClock,
      ActiveIcon: ClipboardClock,
    },
    {
      label: "Calendar",
      link: "/staff/calendar",
      DefaultIcon: Calendar,
      ActiveIcon: Calendar,
    },
    {
      label: "Doctors",
      link: "/staff/doctor",
      DefaultIcon: Stethoscope,
      ActiveIcon: Stethoscope,
    },
    {
      label: "POS",
      link: "/staff/pos",
      DefaultIcon: ShoppingCart,
      ActiveIcon: ShoppingCart,
      subMenu: [
        { label: "Pharmacy", link: "/staff/pos/pharmacy", Icon: Pill },
        {
          label: "Consultation",
          link: "/staff/pos/consultation",
          Icon: Stethoscope,
        },
      ],
    },
    {
      label: "Medicine Inventory",
      link: "/staff/inventory",
      DefaultIcon: Pill,
      ActiveIcon: Pill,
    },
    {
      label: "Transactions",
      link: "/staff/transactions",
      DefaultIcon: Receipt,
      ActiveIcon: Receipt,
    },
  ];

  return <Sidebar menu={staffMenu} />;
};

export default StaffSideBar;
