import type { Metadata } from "next";
import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export const metadata: Metadata = {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--text) px-6 py-12">
            <div className="card max-w-md w-full text-center space-y-5">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-secondary) text-primary">
                        <SearchX size={28} />
                    </div>
                </div>

                <div>
                    <p className="text-sm font-bold text-primary mb-1">404</p>
                    <h1 className="text-2xl font-extrabold">Page not found</h1>
                </div>

                <p className="text-sm opacity-70">
                    The page you&apos;re looking for doesn&apos;t exist, may have moved, or the link is broken.
                </p>

                <Link
                    href="/main/dashboard"
                    className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold !text-white !no-underline shadow-[0_8px_24px_rgba(0,168,90,0.22)] transition hover:-translate-y-0.5 hover:!text-white hover:!no-underline hover:shadow-[0_16px_32px_rgba(0,168,90,0.28)] active:scale-[0.97]"
                >
                    <Home size={18} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
