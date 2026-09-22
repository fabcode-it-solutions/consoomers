import React from "react";
// import Header from "@/layouts/header/AuthHeader";
import Wrapper from "./wrapper/Wrapper";
import { Toaster } from "react-hot-toast";
import { Geist, Work_Sans } from "next/font/google";
import Header from "@/layouts/header/Header";
import Footer from "@/layouts/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Header />
      <main
        className={`!font-workSans ${geistSans.variable} ${workSans.variable} antialiased`}
      >
        <Wrapper>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </Wrapper>
      </main>
      <Footer />
    </>
  );
}
