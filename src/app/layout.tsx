import type { Metadata } from "next";
import { Archivo_Narrow } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/provider/NextAuthSessionProvider";
import StoreProvider from "@/provider/StoreProvider";
import MainWrapper from "./MainWrapper";
import NotificationBellWrapper from "@/components/notification/NotificationWrapper";
const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Honest Feedback. Smarter Brands. Happier Customers. – Consoomers",
  description:
    "Consoomers connects CPG brands with U.S. consumers for product testing, feedback, and insights that shape smarter products and happier people.",
  openGraph: {
    title: "Honest Feedback. Smarter Brands. Happier Customers. – Consoomers",
    description:
      "Consoomers connects CPG brands with U.S. consumers for product testing, feedback, and insights that shape smarter products and happier people.",
    url: "https://consoomers.com/",
    type: "website",
    siteName: "Consoomers",
  },
  alternates: {
    canonical: "https://consoomers.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivoNarrow.variable} font-site  antialiased`}>
        <NextAuthSessionProvider>
          <StoreProvider>
          
            <MainWrapper>{children}</MainWrapper>
          </StoreProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
