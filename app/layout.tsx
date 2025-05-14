"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthProvider } from '../context/AuthContext';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hideHeaderFooter, setHideHeaderFooter] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin")|| pathname.startsWith("/group")) {
      setHideHeaderFooter(true);
    } else {
      setHideHeaderFooter(false);
    }
  }, [pathname]);

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <AuthProvider>
          {!hideHeaderFooter && <Header />}
          <div style={{ margin: hideHeaderFooter ? "0" : "auto", padding: hideHeaderFooter ? "0" : "auto" }}>
            {children}
          </div>
          {!hideHeaderFooter && <Footer />}
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
