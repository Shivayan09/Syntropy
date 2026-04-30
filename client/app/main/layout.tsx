import type { Metadata } from "next";
import MainLayoutClient from "@/components/layouts/MainLayoutClient";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return <MainLayoutClient>{children}</MainLayoutClient>;
}
