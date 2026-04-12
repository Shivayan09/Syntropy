"use client";

import AuthRoute from "@/routes/AuthRoute";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <AuthRoute>
            {children}
        </AuthRoute>
    );
}