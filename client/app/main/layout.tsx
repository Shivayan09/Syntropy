"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "@/components/main/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const pathname = usePathname();
  const isTestPage = pathname === "/main/test" || pathname.startsWith("/main/test/");

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {!isTestPage && (<Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />)}

        <main className={`flex-1 ${isTestPage ? 'overflow-y-auto' : 'overflow-y-auto px-8 py-6 pt-20 md:pt-6'}`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}