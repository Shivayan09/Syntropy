"use client";

import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRoute({ children, }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && user) {
            router.replace("/main/dashboard");
        }
    }, [user, loading]);
    if (loading) {
        return <Loader />;
    }
    if (user) {
        return null;
    }
    return <>{children}</>;
}