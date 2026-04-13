"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "@/components/main/Sidebar";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 md:overflow-y-auto px-8 py-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
}