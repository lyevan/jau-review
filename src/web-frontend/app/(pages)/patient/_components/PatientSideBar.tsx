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
      link: "/patient/doctors",
      DefaultIcon: Stethoscope,
      ActiveIcon: Stethoscope,
    },
    {
      label: "Calendar",
      link: "/patient/calendar",
      DefaultIcon: Calendar,
      ActiveIcon: Calendar,
    },
    {
      label: "My Appointments",
      link: "/patient/appointment",
      DefaultIcon: ClipboardClock,
      ActiveIcon: ClipboardClock,
    },
    {
      label: "My Records",
      link: "/patient/record",
      DefaultIcon: FileUser,
      ActiveIcon: FileUser,
    },
  ];

  return <Sidebar menu={patientMenu} />;
};

export default PatientSideBar;
