"use client";

/* NEXT */
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

/* COMPONENTS */
import SvgIcon from "@/app/_components/SvgIcon";
import { Input } from "@/app/_components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/Popover";
import { Button } from "@/app/_components/ui/Button";
import SettingsModal from "@/app/_components/SettingsModal";
import { User, Settings } from "lucide-react";

/* PLUGINS */
import { signOut } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.first_name || "User";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <nav className="h-[72] border-b border-stroke-gray px-[24] flex items-center justify-between sticky top-0 bg-white z-40">
        <h3 className="text-lg font-semibold text-slate-700 pl-12 md:pl-0">
          Welcome Back, <span className="text-teal-600">{firstName}</span>!
        </h3>

        <div className="flex gap-[16] items-center">
          <button type="button">
            <SvgIcon id="icon-default-analytics" />
          </button>

          <Popover>
            <PopoverTrigger>
              <Image
                alt={`${firstName}'s profile picture`}
                src="/assets/patient.jpg"
                height={40}
                width={40}
                className="size-[40] rounded-full"
              />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[200]">
              <div className="space-y-2">
                <div className="px-2 py-1.5 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-800">
                    {session?.user?.first_name} {session?.user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {session?.user?.role}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="transparent"
                  className="w-full justify-start hover:bg-slate-100"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full"
                  variant="danger"
                >
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Header;
