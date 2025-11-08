"use client";

import SvgIcon from "@/app/_components/SvgIcon";
import Sidebar from "@/app/_layouts/SideBar";
import {
  Calendar,
  ClipboardClock,
  LayoutDashboard,
  LucideIcon,
  UserRoundPlus,
  Clock,
} from "lucide-react";
import { JSX } from "react";

const DoctorSideBar = () => {
  // Add link for each item
  const doctorMenu: {
    label: string;
    link: string;
    DefaultIcon: LucideIcon;
    ActiveIcon: LucideIcon;
  }[] = [
    {
      label: "Dashboard",
      link: "/doctor",
      DefaultIcon: LayoutDashboard,
      ActiveIcon: LayoutDashboard,
    },
    {
      label: "My Appointments",
      link: "/doctor/appointments",
      DefaultIcon: ClipboardClock,
      ActiveIcon: ClipboardClock,
    },
    {
      label: "My Patients",
      link: "/doctor/patient",
      DefaultIcon: UserRoundPlus,
      ActiveIcon: UserRoundPlus,
    },
    {
      label: "Calendar",
      link: "/doctor/calendar",
      DefaultIcon: Calendar,
      ActiveIcon: Calendar,
    },
    {
      label: "My Schedule",
      link: "/doctor/schedule",
      DefaultIcon: Clock,
      ActiveIcon: Clock,
    },
  ];

  return <Sidebar menu={doctorMenu} />;
};

export default DoctorSideBar;
