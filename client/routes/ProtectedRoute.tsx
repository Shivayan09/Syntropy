"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../components/Loader";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login");
        }
    }, [user, loading]);
    if (loading) {
        return <Loader />;
    }
    if (!user) {
        return null;
    }
    return <>{children}</>;
}