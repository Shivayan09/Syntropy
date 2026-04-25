"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../components/utils/Loader";

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/auth/login");
            }
        }
    }, [user, loading, router]);
    if (loading) {
        return <Loader />;
    }
    if (!user) {
        return null;
    }
    return <>{children}</>;
}
