"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../components/utils/Loader";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login");
        } else if (!loading && user && !user.onboardingCompleted) {
            router.replace("/onboarding");
        }
    }, [user, loading, router]);
    if (loading) {
        return <Loader />;
    }
    if (!user || !user.onboardingCompleted) {
        return null;
    }
    return <>{children}</>;
}
