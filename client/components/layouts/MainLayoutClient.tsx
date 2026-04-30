"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "@/components/main/Sidebar";
import Footer from "@/components/Landing/Footer";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function MainLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const pathname = usePathname();
  const isTestPage =
    pathname === "/main/test" || pathname.startsWith("/main/test/");

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {!isTestPage && (
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className={`flex-1 ${isTestPage ? "" : "px-4 md:px-8 py-6 pt-20 md:pt-6"}`}>
              {children}
            </div>

            {!isTestPage && <Footer />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
