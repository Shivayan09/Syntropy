import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "Learn what cookies Syntropy uses and why.",
    alternates: {
        canonical: "/cookie-policy",
    },
};

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-(--bg) text-(--text) px-6 py-12">
            <div className="max-w-4xl mx-auto card space-y-6">

                <h1 className="text-3xl">Cookie Policy</h1>
                <p className="text-sm opacity-70">
                    Effective Date: 29th April 2026
                </p>

                <section>
                    <h2 className="text-xl mb-2">1. What Are Cookies</h2>
                    <p>
                        Cookies are small pieces of data stored on your device by your browser. They can be
                        used to keep you signed in, remember preferences, or track behavior across sites.
                        This page explains exactly which cookies Syntropy uses and why.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">2. Strictly Necessary Cookies</h2>
                    <p>We set one cookie, and it is required for the platform to work:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            <span className="font-semibold">token</span> — an httpOnly authentication cookie
                            that keeps you signed in. It is secure (sent only over HTTPS in production),
                            cannot be read by JavaScript, and expires after 7 days.
                        </li>
                    </ul>
                    <p className="mt-2">
                        Because this cookie is strictly necessary for login to function, it is set
                        automatically and cannot be disabled while still using an account on Syntropy. We do
                        not use it for advertising or cross-site tracking.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">3. Third-Party Cookies</h2>
                    <p>
                        We do not set any advertising or tracking cookies ourselves. However, a few
                        third-party scripts we load may set their own cookies, governed by their own
                        policies:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            <span className="font-semibold">Vercel Analytics</span> — collects anonymized,
                            aggregate page-view analytics without using tracking cookies.
                        </li>
                        <li>
                            <span className="font-semibold">Google Sign-In</span> — if you choose to sign in
                            with Google, Google&apos;s script may set its own cookies as part of that sign-in
                            flow.
                        </li>
                        <li>
                            <span className="font-semibold">Razorpay Checkout</span> — loaded only on the
                            subscription/checkout page, and may set cookies to process payments and prevent
                            fraud.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl mb-2">4. Managing Cookies</h2>
                    <p>
                        Since Syntropy itself only sets the strictly-necessary session cookie described above,
                        there is no separate cookie preference center on this site. You can still control or
                        clear cookies at any time through your browser&apos;s settings — note that blocking the
                        session cookie will prevent you from staying signed in.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">5. Changes to This Policy</h2>
                    <p>
                        We may update this Cookie Policy if the cookies we use change. Continued use of the
                        platform after a change constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">6. Related Policies</h2>
                    <p>
                        See our{" "}
                        <Link href="/privacy-policy" className="font-bold text-primary underline">
                            Privacy Policy
                        </Link>{" "}
                        for details on what personal data we collect and how it is used, and our{" "}
                        <Link href="/terms-and-conditions" className="font-bold text-primary underline">
                            Terms and Conditions
                        </Link>{" "}
                        for the terms of using Syntropy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">7. Contact</h2>
                    <p>Email: syntropy.tests@gmail.com</p>
                </section>

                <div className="text-sm opacity-60 pt-4 border-t">
                    Last updated: April 2026
                </div>

            </div>
        </div>
    );
}
