"use client";
import { Search, Menu, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "@/components/ui/Button";
import { usePathname } from "next/navigation";

import { signOut, useSession } from "next-auth/react";

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user || null;

  const activePaths = [
    "/dashboard/brand-request",
    "/dashboard/brands",
    "/dashboard/categories",
  ];
  const isActive = activePaths.some((path) => pathname.startsWith(path));

  const activePathsTester = ["/dashboard/tester"];
  const isActiveTester = activePathsTester.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <header className="bg-slate-900 border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden text-slate-200 p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parts, categories, brands..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className={`!px-[25px] !py-[10px] text-slate-200 border-slate-700/50 ${
              isActiveTester ? "border-1 border-yellow-200" : ""
            }`}
            onClick={() => {
              window.location.href = "/dashboard/tester";
            }}
          >
            Tester
          </Button>

          <Button
            className={`!px-[25px] !py-[10px] text-slate-200 border-slate-700/50 ${
              isActive ? "border-1 border-yellow-200" : ""
            }`}
            onClick={() => {
              window.location.href = "/dashboard/brands";
            }}
          >
            Brand
          </Button>
        

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          {/* {user?.id && <NotificationDropdown adminId={user.id}    notificationId={user.notificationId} // From users table
 />} */}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-slate-700 hover:ring-slate-600 transition-all">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-slate-900 border border-slate-700/50 rounded-lg p-2 shadow-2xl min-w-[200px] animate-in fade-in slide-in-from-top-2"
                sideOffset={5}
              >
                {/* User Info */}
                <div className="px-3 py-2 border-b border-slate-700/50 mb-2">
                  <p className="text-slate-50 text-sm font-medium">
                    {user?.name ?? user?.email ?? "Admin"}
                  </p>
                  <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>

                {/* Settings */}
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-slate-50 hover:bg-slate-800/50 rounded cursor-pointer outline-none">
                  <User className="w-4 h-4" />
                  Profile Settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-slate-700/50 my-2" />

                {/* Sign Out */}
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                  onClick={() => signOut()}
                >
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        </div>
      </div>
    </header>
  );
}
