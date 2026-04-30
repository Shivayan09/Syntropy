import type { Metadata } from "next";
import AuthLayoutClient from "@/components/layouts/AuthLayoutClient";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
