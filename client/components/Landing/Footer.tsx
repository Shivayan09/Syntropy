"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <div className="py-6 border-t border-(--border)">
            <footer className="mx-auto px-4 flex flex-col items-center gap-3 text-sm text-gray-500">
                
                <div className="flex gap-4 flex-wrap justify-center">
                    <Link href="/terms-and-conditions" className="hover:text-(--text)">
                        Terms
                    </Link>
                    <Link href="/privacy-policy" className="hover:text-(--text)">
                        Privacy
                    </Link>
                    <Link href="/cookie-policy" className="hover:text-(--text)">
                        Cookies
                    </Link>
                    <Link href="/terms-and-conditions" className="hover:text-(--text)">
                        Refund
                    </Link>
                </div>

                <p className="text-center">
                    Syntropy is a practice platform. AI-generated content may not be fully accurate
                    and should not be solely relied upon for academic outcomes.
                </p>

                <p className="text-xs opacity-60">
                    © {new Date().getFullYear()} Syntropy
                </p>

            </footer>
        </div>
    );
}