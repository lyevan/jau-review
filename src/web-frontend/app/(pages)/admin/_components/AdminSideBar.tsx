"use client";

import Sidebar from "@/app/_layouts/SideBar";
import {
  Calendar,
  ChartLine,
  FileUser,
  LayoutDashboard,
  ClipboardClock,
  Stethoscope,
  Pill,
  Users,
  ShoppingCart,
  HandCoins,
  Megaphone,
  Settings,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

const AdminSideBar = () => {
  const adminMenu: {
    label: string;
    link: string;
    DefaultIcon: LucideIcon;
    ActiveIcon: LucideIcon;
    subMenu?: { label: string; link: string; Icon?: LucideIcon }[];
  }[] = [
    {
      label: "Dashboard",
      link: "/admin",
      DefaultIcon: LayoutDashboard,
      ActiveIcon: LayoutDashboard,
    },
    {
      label: "Patient Records",
      link: "/admin/patient",
      DefaultIcon: FileUser,
      ActiveIcon: FileUser,
    },
    {
      label: "Appointments",
      link: "/admin/appointment",
      DefaultIcon: ClipboardClock,
      ActiveIcon: ClipboardClock,
    },
    {
      label: "Calendar",
      link: "/admin/calendar",
      DefaultIcon: Calendar,
      ActiveIcon: Calendar,
    },
    {
      label: "Doctors",
      link: "/admin/doctor",
      DefaultIcon: Stethoscope,
      ActiveIcon: Stethoscope,
    },
    {
      label: "POS",
      link: "/admin/pos",
      DefaultIcon: ShoppingCart,
      ActiveIcon: ShoppingCart,
      subMenu: [
        { label: "Pharmacy", link: "/admin/pos/pharmacy", Icon: Pill },
        {
          label: "Consultation",
          link: "/admin/pos/consultation",
          Icon: Stethoscope,
        },
      ],
    },
    {
      label: "Services",
      link: "/admin/services",
      DefaultIcon: Settings,
      ActiveIcon: Settings,
    },
    {
      label: "Transactions",
      link: "/admin/transactions",
      DefaultIcon: HandCoins,
      ActiveIcon: HandCoins,
    },
    {
      label: "Medicine Inventory",
      link: "/admin/inventory",
      DefaultIcon: Pill,
      ActiveIcon: Pill,
    },
    {
      label: "Reports & Analytics",
      link: "/admin/reports_analytics",
      DefaultIcon: ChartLine,
      ActiveIcon: ChartLine,
    },
    {
      label: "User Management",
      link: "/admin/user-management",
      DefaultIcon: Users,
      ActiveIcon: Users,
    },
    {
      label: "Announcement",
      link: "/admin/announcement_management",
      DefaultIcon: Megaphone,
      ActiveIcon: Megaphone,
    },
  ];

  return <Sidebar menu={adminMenu} />;
};

export default AdminSideBar;
