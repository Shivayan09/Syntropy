import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="h-screen w-full">{children}</div>;
}