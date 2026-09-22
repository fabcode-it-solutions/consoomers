"use client";

import React from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Anchor from "@/components/ui/Anchor";

const Header = () => {
  const pathname = usePathname();
  const signUp = pathname.includes("/accounts/register/");
  const isSignInPage =
    pathname === "/accounts/sign-in" ||
    pathname === "/accounts/forgot-password";

  return (
    <header className="bg-white">
      <Container
        className={` flex flex-row justify-between gap-[30px] py-[30px]  `}
      >
        <Link href="/">
          <Image
            src="/assets/images/Logo.png"
            alt=""
            width={121}
            height={70}
            unoptimized
          />
        </Link>

        <div className="flex justify-between gap-2 items-center">
          {signUp && (
            <Anchor href="/accounts/sign-in"> Already have an account?</Anchor>
          )}
          {isSignInPage && (
            <Anchor href="/accounts/register/brand"> Join as a brand</Anchor>
          )}
          {isSignInPage && (
            <Anchor href="/accounts/register/tester"> JOIN AS A TESTER</Anchor>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
