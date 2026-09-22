"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  ChevronDown,
  Bell,
  Users,
  Codepen,
  BookCheck,
  Vote,
  GitPullRequest,
  LockKeyhole,
  ChartBarStacked,
  KeyboardMusic,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useEffect, useState } from "react";

type ChildItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
};

type MenuItem = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: ChildItem[];
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);

    const menusToOpen: string[] = [];

    if (pathname === "/dashboard") {
      menusToOpen.push("Brands", "Tester", "Vote Options Manage");
    } else {
      if (pathname.startsWith("/dashboard/brands") || pathname.startsWith("/dashboard/brand-request") || pathname.startsWith("/dashboard/brand-access") || pathname.startsWith("/dashboard/categories") ) {
        menusToOpen.push("Brands");
      }
      if (pathname.startsWith("/dashboard/tester")) {
        menusToOpen.push("Tester");
      }
      if (pathname.startsWith("/dashboard/vote")) {
        menusToOpen.push("Vote Options Manage");
      }
    }

    setOpenMenus(menusToOpen);
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  if (!mounted) return null;

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Brands",
      children: [
        {
          title: "Brands",
          href: "/dashboard/brands",
          icon: <Codepen className="w-4 h-4" />,
        },
        {
          title: "Brand Request",
          href: "/dashboard/brand-request",
          icon: <GitPullRequest className="w-4 h-4" />,
        },
         {
          title: "Brand Access Password",
          href: "/dashboard/brand-access",
          icon: <LockKeyhole className="w-4 h-4" />,
        },
         {
          title: "Categories Management",
          href: "/dashboard/categories",
          icon: <ChartBarStacked className="w-4 h-4" />,
        },
         {
          title: "Products",
          href: "/dashboard/products",
          icon:  <KeyboardMusic className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Tester",
      children: [
        {
          title: "Tester",
          href: "/dashboard/tester",
          icon: <BookCheck className="w-4 h-4" />,
        },
         {
          title: "Sample Products ",
          href: "/dashboard/tester/sample-requests",
          icon: <BookCheck className="w-4 h-4" />,
        },
         {
          title: "Sample Products Request ",
          href: "/dashboard/tester/sample-products",
          icon: <BookCheck className="w-4 h-4" />,
        },
         {
          title: "Review Requests",
          href: "/dashboard/tester/review-requests",
          icon: <BookCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Vote Options Manage",
      children: [
        {
          title: "Add Vote Options",
          href: "/dashboard/vote",
          icon: <Vote className="w-4 h-4" />,
        },
        {
          title: "Manage Votes",
          href: "/dashboard/vote/manage-vote",
          icon: <GitPullRequest className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="w-4 h-4" />,
    },
  ];



  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-700/50 max-tab-lg:hidden">
      <div className="flex flex-col h-full max-h-dvh sticky top-0">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <Link
            href="/"
            className="font-sofia-sans text-sm text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
          >
            ← Back to Site
          </Link>
          <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#f1f5f9] font-audiowide text-xl">Admin</h1>
              <p className="text-[#94a3b8] text-xs font-sofia-sans">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            return (
              <div key={item.title} className={`${item.children ? "mb-0" : "mb-2"}`}>
                {item.children ? (
                  <Collapsible.Root
                    open={openMenus.includes(item.title)}
                    onOpenChange={() => toggleMenu(item.title)}
                  >
                    <Collapsible.Trigger className="flex cursor-pointer items-center justify-between w-full px-2 mb-0 min-h-10 text-xs font-sofia-sans font-semibold text-[#94a3b8] uppercase tracking-wider hover:text-[#f1f5f9] transition-colors">
                      {item.title}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openMenus.includes(item.title) ? "rotate-180" : ""
                        }`}
                      />
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <div className="space-y-1 py-2 border-b border-slate-700/50">
                        {item.children.map((child) => {
                          const isActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all ${
                                isActive
                                  ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                                  : "text-[#94a3b8] hover:bg-slate-800/50 hover:text-[#f1f5f9]"
                              }`}
                            >
                              {child.icon}
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                ) : (
                  <Link
                    href={item.href || ""}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all ${
                      pathname === item.href
                        ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-[#94a3b8] hover:bg-slate-800/50 hover:text-[#f1f5f9]"
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-slate-700">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-[#f1f5f9] text-sm font-sofia-sans font-medium">
                Admin User
              </p>
              <p className="text-[#94a3b8] text-xs">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
