"use client";

/* NEXT */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* COMPONENTS */
import {
  LucideIcon,
  PanelLeftClose,
  PanelRightOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

/* STORE */
import { useSidebarStore } from "@/app/_stores/useSidebarStore";

/* UTILITIES */
import { cn } from "@/app/_utils";
import { useState, useEffect } from "react";

interface SubMenuItem {
  label: string;
  link: string;
  Icon?: LucideIcon;
}

interface MenuItem {
  label: string;
  link: string;
  DefaultIcon: LucideIcon;
  ActiveIcon: LucideIcon;
  subMenu?: SubMenuItem[];
}

interface Props {
  menu: MenuItem[];
}

const Sidebar = ({ menu }: Props) => {
  const setOpenSidebar = useSidebarStore((state) => state.setOpenSidebar);
  const is_sidebar_open = useSidebarStore((state) => state.is_sidebar_open);
  const pathname = usePathname();

  const [openSub, setOpenSub] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Sidebar content component (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* HEADER */}
      <div
        className={cn("flex justify-between p-3", {
          "justify-center": !is_sidebar_open && !isMobile,
        })}
      >
        <Image
          alt="JAU Logo"
          src="/jau_logo.png"
          width={126}
          height={35}
          className={cn("h-[35px] transition-all duration-300", {
            "opacity-100": is_sidebar_open || isMobile,
            "opacity-0 w-0": !is_sidebar_open && !isMobile,
          })}
        />
        {!isMobile && (
          <button
            type="button"
            className="cursor-pointer text-white"
            onClick={() => setOpenSidebar(!is_sidebar_open)}
          >
            {is_sidebar_open ? (
              <PanelLeftClose className="text-white" />
            ) : (
              <PanelRightOpen className="text-white" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            className="cursor-pointer text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="text-white" />
          </button>
        )}
      </div>

      {/* MAIN MENU */}
      <ul className="flex flex-col gap-1">
        {menu.map((link, index) => {
          const is_active = pathname === link.link;
          const is_sub_open = openSub === link.label;

          return (
            <li key={index} className="relative">
              {/* MAIN BUTTON */}
              {link.subMenu ? (
                <button
                  onClick={() => setOpenSub(is_sub_open ? null : link.label)}
                  className={cn(
                    "group flex items-center w-full h-[42px] pl-3 text-left text-white hover:bg-teal-600 border-r-4 border-transparent transition-all",
                    {
                      "bg-teal-800 border-r-teal-300": is_active,
                    }
                  )}
                >
                  <link.DefaultIcon
                    className={cn("shrink-0 text-white", {
                      "text-white": is_active,
                    })}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300 text-white overflow-hidden whitespace-nowrap",
                      {
                        "opacity-100 ml-2": is_sidebar_open || isMobile,
                        "opacity-0 w-0": !is_sidebar_open && !isMobile,
                      }
                    )}
                  >
                    {link.label}
                  </span>

                  {(is_sidebar_open || isMobile) && (
                    <span className="ml-auto pr-2">
                      {is_sub_open ? (
                        <ChevronDown size={16} className="text-white" />
                      ) : (
                        <ChevronRight size={16} className="text-white" />
                      )}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={link.link}
                  className={cn(
                    "group flex items-center w-full h-[42px] pl-3 text-left text-white hover:bg-teal-600 border-r-4 border-transparent transition-all",
                    {
                      "bg-teal-800 border-r-teal-300": is_active,
                    }
                  )}
                >
                  <link.DefaultIcon
                    className={cn("shrink-0 text-white", {
                      "text-white": is_active,
                    })}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300 text-white overflow-hidden whitespace-nowrap",
                      {
                        "opacity-100 ml-2": is_sidebar_open || isMobile,
                        "opacity-0 w-0": !is_sidebar_open && !isMobile,
                      }
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              )}

              {/* SUBMENU */}
              {link.subMenu && is_sub_open && (is_sidebar_open || isMobile) && (
                <ul className="ml-8 mt-1 flex flex-col gap-1">
                  {link.subMenu.map((sub, subIndex) => {
                    const is_sub_active =
                      pathname === sub.link || pathname.startsWith(sub.link);

                    return (
                      <li
                        key={subIndex}
                        className={cn(
                          "hover:bg-teal-600 border-r-4 border-transparent transition-all",
                          {
                            "bg-teal-800 border-r-teal-300": is_sub_active,
                          }
                        )}
                      >
                        <Link
                          href={sub.link}
                          className="flex items-center gap-1.5 pl-2 pr-3 h-9 text-sm text-white"
                        >
                          {sub.Icon && (
                            <sub.Icon
                              size={14}
                              className="text-white shrink-0"
                            />
                          )}
                          {sub.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-teal-700 text-white rounded-lg shadow-lg hover:bg-teal-600 transition-colors touch-manipulation md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <nav
          className={cn(
            "bg-teal-700 fixed left-0 top-0 z-50 h-full w-[280px] flex flex-col gap-2 transition-transform duration-300 overflow-y-auto shadow-2xl md:hidden",
            {
              "translate-x-0": isMobileMenuOpen,
              "-translate-x-full": !isMobileMenuOpen,
            }
          )}
        >
          <SidebarContent />
        </nav>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <nav
      className={cn(
        "bg-teal-700 fixed left-0 z-40 h-full flex-col gap-2 transition-all duration-500 overflow-y-auto shadow-lg hidden md:flex",
        {
          "w-[200px]": is_sidebar_open,
          "w-[55px]": !is_sidebar_open,
        }
      )}
    >
      <SidebarContent />
    </nav>
  );
};

export default Sidebar;
