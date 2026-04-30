"use client";

import AuthRoute from "@/routes/AuthRoute";
import type { ReactNode } from "react";

export default function AuthLayoutClient({ children }: { children: ReactNode }) {
  return <AuthRoute>{children}</AuthRoute>;
}
