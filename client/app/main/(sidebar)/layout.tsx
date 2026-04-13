import type { ReactNode } from "react";
import Sidebar from "@/components/main/Sidebar";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto w-screen px-8 py-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
}