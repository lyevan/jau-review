"use client";
import {
  Calendar,
  ClipboardClock,
  ClipboardList,
  FileText,
  FileUser,
  LayoutDashboard,
  LucideIcon,
  Stethoscope,
} from "lucide-react";
import Sidebar from "@/app/_layouts/SideBar";

const PatientSideBar = () => {
  // Add path for each item
  const patientMenu: {
    label: string;
    link: string;
    DefaultIcon: LucideIcon;
    ActiveIcon: LucideIcon;
  }[] = [
    {
      label: "Dashboard",
      link: "/patient",
      DefaultIcon: LayoutDashboard,
      ActiveIcon: LayoutDashboard,
    },
    {
      label: "Doctors",
      link: "/doctors",
      DefaultIcon: Stethoscope,
      ActiveIcon: Stethoscope,
    },
    {
      label: "Calendar",
      link: "/calendar",
      DefaultIcon: Calendar,
      ActiveIcon: Calendar,
    },
    {
      label: "My Appointments",
      link: "/appointment",
      DefaultIcon: ClipboardClock,
      ActiveIcon: ClipboardClock,
    },
    {
      label: "My Records",
      link: "/record",
      DefaultIcon: FileUser,
      ActiveIcon: FileUser,
    },
  ];

  return <Sidebar menu={patientMenu} />;
};

export default PatientSideBar;
