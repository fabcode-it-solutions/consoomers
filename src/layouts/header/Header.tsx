/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Container from "@/components/ui/Container";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "@/form/LogoutButton";
import { UserResponse } from "@/types";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDispatch } from "react-redux";
import { setUser } from "@/libs/redux/slices/authSlice";
import WishlistTooltip from "@/components/sections/Wishlist/WishlistTooltip";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";
import {
  LayoutDashboard,
  Package,
  Settings2,
  User2,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import NotificationBellWrapper from "@/components/notification/NotificationWrapper";

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const { request } = useApiRequest();
  const dispatch = useDispatch();
  const user = useAppSelector(selectUser);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      const fetchUser = async () => {
        try {
          const response = (await request({
            url:
              "/api/user?email=" +
              encodeURIComponent(String(session.user.email)),
            enableToast: false,
          })) as UserResponse;

          if (response?.user?.id) {
            localStorage.setItem("userIdConsoomer", String(response.user.id));
            dispatch(setUser(response.user));
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      };
      fetchUser();
    }
  }, [session]);

  const dashboardLink = session?.user
    ? {
        name: "Account",
        href: session.user.role === "tester" ? "/profile/" : "/profile/brand",
      }
    : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    {
      title: "Browse by brand",
      submenu: [
        { title: "Bachca", href: "/collections/bachca" },
        { title: "Emily's Pillow", href: "/collections/emily-s-pillow" },
        {
          title: "Luc Kieffer Paris",
          href: "/collections/luc-kieffer-paris",
        },
        { title: "Masami", href: "/collections/masami" },
        { title: "Noori Skincare", href: "/collections/noori-skincare" },
        { title: "Topical Skin", href: "/collections/topical-skin" },
      ],
    },
    {
      title: "Browse by category",
      submenu: [
        {
          title: "Fashion Accessories",
          href: "/category/fashion-accessories",
        },
        { title: "Hair Care", href: "/category/hair-care" },
        { title: "Personal Care", href: "/category/personal-care" },
        { title: "Skin Care", href: "/category/skin-care" },
      ],
    },
    {
      title: "Join us",
      submenu: [
        { title: "Brands", href: "/accounts/register/brand" },
        { title: "Tester", href: "/accounts/register/tester" },
      ],
    },
    { title: "About", href: "/about-us" },
    { title: "Contact Us", href: "/contact-us" },
  ];

  const accountsNavigation = useMemo(() => {
    if (!session?.user || !user) return [];
    return [
      {
        label: "Account",
        link: `/profile/${user?.id}`,
        icon: User2,
        action: () => {},
      },
      ...(user.role !== "tester"
        ? [
            {
              label: "Add product",
              link: "/brand/create-product",
              icon: Package,
              action: () => {},
            },
          ]
        : []),
      {
        label: "Settings",
        link: "/settings",
        icon: Settings2,
        action: () => {},
      },
    ];
  }, [dashboardLink, session, user]);

  return (
    <Container>
      <header className="py-3 md:py-4 relative">
        <div className="flex items-center justify-between w-full gap-2 sm:gap-3 md:gap-4">
          {/* Mobile Menu Button - Left Side */}
          <button
            className="lg:hidden p-1.5 sm:p-2 order-1 z-50 relative"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex flex-1 justify-start gap-4 xl:gap-6 2xl:gap-8 text-sm font-medium text-[#151515] order-2">
            <ul className="flex gap-2 xl:gap-3 2xl:gap-4">
              {navLinks.map((item, index) => (
                <li
                  key={index}
                  className={`relative py-2 xl:py-3 px-1.5 xl:px-2 cursor-pointer text-[#121212BF] tracking-[0.06rem] whitespace-nowrap ${
                    item.submenu ? "group" : ""
                  }`}
                >
                  {item.href ? (
                    <Link href={item.href} className="hover:underline text-xs xl:text-sm">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="hover:underline text-xs xl:text-sm">{item.title}</span>
                  )}
                  {item.submenu && (
                    <svg
                      className="icon icon-caret inline-block ml-1 h-[.4rem] xl:h-[.5rem] transition-transform duration-300 group-hover:rotate-180 w-[8px] xl:w-[10px]"
                      viewBox="0 0 10 6"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {item.submenu && (
                    <div className="absolute left-0 top-full w-[180px] xl:w-[200px] bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-200 rounded-none p-3 xl:p-4 z-50">
                      <div className="flex flex-col">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="block text-gray-700 hover:text-black hover:underline py-1.5 xl:py-2 text-xs xl:text-sm"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logo - Center */}
          <Link href="/" className="flex justify-center order-2 lg:order-3">
            <Image
              src="/assets/images/Logo.png"
              alt="Consoomers Logo"
              width={90}
              height={52}
              className="w-[90px] h-auto sm:w-[100px] md:w-[110px] lg:w-[121px]"
              priority
            />
          </Link>

          {/* Right Side Icons and User Menu */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 order-3 lg:order-4 lg:flex-1">
            <NotificationBellWrapper />
            
            {user?.role === "tester" && <WishlistTooltip />}

            {user?.role === "admin" && (
              <>
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-[#0060FF] text-white hover:bg-accent-100/90 transition-colors font-sofia-sans text-xs lg:text-sm whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="flex md:hidden justify-center items-center cursor-pointer"
                >
                  <span className="flex justify-center items-center border-[#00202914] border-[1.5px] p-1 sm:p-1.5 rounded-full w-7 h-7 sm:w-8 sm:h-8 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                </Link>
              </>
            )}

            {session?.user && user ? (
              <div className="relative" ref={tooltipRef}>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="!outline-none flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                    <Image
                      src={user?.profileImage || "/assets/images/user.png"}
                      alt={user?.firstName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-300 object-cover w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
                    />
                    <span className="hidden md:block text-xs lg:text-sm font-medium text-gray-800 max-w-[80px] lg:max-w-none truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content
                    sideOffset={5}
                    className="!outline-none z-10 bg-white border border-gray-200 w-40 md:w-44 shadow-lg rounded"
                  >
                    {accountsNavigation.map((item, index) => (
                      <React.Fragment key={index}>
                        <DropdownMenu.Item asChild>
                          <Link
                            href={item.link}
                            className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-100 flex gap-2 items-center"
                          >
                            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                            {item.label}
                          </Link>
                        </DropdownMenu.Item>

                        {index !== accountsNavigation.length - 1 && (
                          <DropdownMenu.Separator className="border-t border-gray-100" />
                        )}
                      </React.Fragment>
                    ))}

                    <DropdownMenu.Separator className="border-t border-gray-100" />

                    <DropdownMenu.Item asChild>
                      <LogoutButton className="w-full flex justify-start pl-3 md:pl-4 hover:border-2 hover:rounded hover:border-gray-300 text-xs md:text-sm" />
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            ) : (
              <Button
                onClick={() => router.push("/accounts/sign-in")}
                className="text-white !px-2 sm:!px-3 md:!px-4 lg:!px-6 !py-2 sm:!py-2.5 md:!py-3 transform transition-all hover:scale-105 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
              >
                COMMUNITY LOGIN
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay with Slide Animation */}
        <>
          {/* Backdrop */}
          <div
            className={`lg:hidden fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
              isOpen ? 'opacity-30 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Sliding Menu */}
          <nav
            className={`lg:hidden fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4 sm:p-6">
              {/* Close button inside menu */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col gap-2">
                {navLinks.map((item, index) => (
                  <div key={index} className="w-full border-b border-gray-100 pb-2">
                    <div className="flex justify-between items-center">
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="text-base font-medium text-[#151515] py-2"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <button
                          className="text-base font-medium text-[#151515] flex-1 text-left py-2"
                          onClick={() =>
                            setOpenIndex((prev) => (prev === index ? null : index))
                          }
                        >
                          {item.title}
                        </button>
                      )}
                      {item.submenu && (
                        <button
                          onClick={() =>
                            setOpenIndex((prev) => (prev === index ? null : index))
                          }
                          className="text-gray-600 p-2"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${
                              openIndex === index ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 10 6"
                          >
                            <path
                              fill="currentColor"
                              fillRule="evenodd"
                              d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {item.submenu && openIndex === index && (
                      <div className="mt-2 ml-3 sm:ml-4 flex flex-col gap-2 border-l-2 border-gray-200 pl-3 sm:pl-4">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="text-sm text-gray-700 hover:text-black py-1.5 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </>
      </header>
    </Container>
  );
};

export default Header;