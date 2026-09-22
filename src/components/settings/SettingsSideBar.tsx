"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LockKeyhole,
  ShieldCheck,
  UserX,
  Cog,
  Home,
} from "lucide-react";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [loadingDeactivate, setLoadingDeactivate] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const menuItems = [
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      title: "Password Change",
      href: "/settings/change-password",
      icon: <LockKeyhole className="w-4 h-4" />,
    },
    {
      title: "Data & Privacy Controls",
      href: "/settings/data-privacy",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON */}
      <button
        className="lg:hidden fixed top-26 left-1 p-2 border bg-white z-50 rounded-sm"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white border-r shadow-lg z-50 
        transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div onClick={() => router.push("/settings")}>
            {" "}
            <Heading level={2}>Settings</Heading>
          </div>
          <Link href="/" className="flex items-center">
            <Home className="w-7 h-7" />
          </Link>
        </div>

        <nav className="px-4 py-6 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-md transition-all ${
                  isActive
                    ? "bg-blue-50 text-black border-l-2 border-black shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}

          <div
            onClick={() => {
              setOpen(false);
              setShowDeactivateModal(true);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-red-600 cursor-pointer"
          >
            <UserX className="w-4 h-4" /> Deactivate Account
          </div>
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 border-r h-screen flex-col sticky top-0 left-0 ">
        <div className="px-6 py-6 border-b">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/10">
              <Cog className="w-8 h-8 text-white" />
            </div>
            <div>
              <Heading level={2}>Settings</Heading>
              {/* <p className="text-gray-500 text-md">Manage Account</p> */}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-black border-l-2 border-black shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:border-l-2"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}

          <div
            onClick={() => setShowDeactivateModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-red-600 cursor-pointer"
          >
            <UserX className="w-4 h-4" /> Deactivate Account
          </div>
        </nav>

        {/* <div className="mt-auto p-4 border-t flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/assets/images/Logo.png"
              alt="Consoomers Logo"
              width={121}
              height={70}
              priority
            />
          </Link>
        </div> */}
      </aside>

      {/* MODAL to Deactivate Account*/}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[99] flex items-center justify-center">
          <div className="bg-white p-6 rounded-sm w-full max-w-lg shadow-xl">
            <Heading level={2}>
              Are you sure you want to Deactivate Your Account ?
            </Heading>

            <p className="text-gray-600 mb-6 text-md leading-relaxed mt-3">
              Your account will be <strong>deactivated</strong>. You will no
              longer be able to log in unless you reactivate your account.
            </p>

            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowDeactivateModal(false)}
                className="bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  setLoadingDeactivate(true);
                  const res = await fetch("/api/account/deactivate", {
                    method: "POST",
                  });
                  setLoadingDeactivate(false);

                  if (res.ok) {
                    setShowDeactivateModal(false);
                    toast.success("Your account has been deactivated.");
                    await signOut({ callbackUrl: "/accounts/sign-in" });
                  } else {
                    toast.error("Something went wrong. Please try again.");
                  }
                }}
                className="text-white bg-red-600 hover:bg-red-700"
              >
                {loadingDeactivate ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
