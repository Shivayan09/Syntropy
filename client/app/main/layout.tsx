"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="h-screen w-full">
        {children}
      </div>
    </ProtectedRoute>
  );
}