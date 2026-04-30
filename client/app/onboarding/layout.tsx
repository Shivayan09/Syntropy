import type { Metadata } from "next";
import OnboardingRoute from "@/routes/OnboardingRoute";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <OnboardingRoute>{children}</OnboardingRoute>;
}
