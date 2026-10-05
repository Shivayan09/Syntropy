"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "syntropy_cookie_consent";
const ACCEPTED = "accepted";

const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
};

const getConsentSnapshot = () => {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return ACCEPTED;
    }
};

// Assume accepted during SSR/hydration so the banner never flashes before we can check
// localStorage; useSyncExternalStore reconciles with the real client value right after.
const getServerConsentSnapshot = () => ACCEPTED;

export default function CookieConsentBanner() {
    const consent = useSyncExternalStore(subscribe, getConsentSnapshot, getServerConsentSnapshot);
    const visible = consent !== ACCEPTED;

    const accept = useCallback(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, ACCEPTED);
        } catch {
            // Ignore storage failures (e.g. private browsing) — banner just reappears next visit.
        }
        // localStorage's native "storage" event only fires in other tabs, so dispatch one
        // manually to make this tab's useSyncExternalStore re-read the snapshot immediately.
        window.dispatchEvent(new Event("storage"));
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
            <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-primary bg-(--bg-secondary) p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-(--text)">
                    We use a strictly-necessary cookie to keep you signed in. See our{" "}
                    <Link href="/cookie-policy" className="font-bold text-primary underline">
                        Cookie Policy
                    </Link>{" "}
                    for details.
                </p>
                <button onClick={accept} className="shrink-0 whitespace-nowrap">
                    Got it
                </button>
            </div>
        </div>
    );
}
