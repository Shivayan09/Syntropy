import OnboardingRoute from "@/routes/OnboardingRoute";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <OnboardingRoute>{children}</OnboardingRoute>;
}