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
      <main className="flex-1 md:overflow-y-auto bg-secondary w-screen">
        {children}
      </main>
    </div>
  );
}