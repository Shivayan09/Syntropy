import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn what data Syntropy collects, how it is used, and your rights over it.",
    alternates: {
        canonical: "/privacy-policy",
    },
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-(--bg) text-(--text) px-6 py-12">
            <div className="max-w-4xl mx-auto card space-y-6">

                <h1 className="text-3xl">Privacy Policy</h1>
                <p className="text-sm opacity-70">
                    Effective Date: 29th April 2026
                </p>

                <section>
                    <h2 className="text-xl mb-2">1. Overview</h2>
                    <p>
                        This Privacy Policy explains what information Syntropy collects when you use the
                        platform, how that information is used, who it is shared with, and the choices you
                        have. It should be read alongside our{" "}
                        <Link href="/terms-and-conditions" className="font-bold text-primary underline">
                            Terms and Conditions
                        </Link>{" "}
                        and our{" "}
                        <Link href="/cookie-policy" className="font-bold text-primary underline">
                            Cookie Policy
                        </Link>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">2. Information We Collect</h2>

                    <h3 className="font-semibold mt-2">2.1 Account Information</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Name, username, email address, and phone number</li>
                        <li>Password (stored as a one-way hash — we never store or see your plain-text password)</li>
                        <li>College and semester, if you provide them</li>
                        <li>
                            If you sign in with Google: your Google account name, email address, profile
                            picture, and Google account identifier
                        </li>
                    </ul>

                    <h3 className="font-semibold mt-2">2.2 Usage and Performance Data</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Tests you create, attempt, or generate, and your answers to them</li>
                        <li>Scores, accuracy, time taken, streaks, and other performance analytics</li>
                        <li>Syllabus files you upload and the text extracted from them</li>
                        <li>AI credit / token usage and your subscription plan and billing cycle</li>
                        <li>Preferences you set, such as subjects, difficulty, and target role</li>
                    </ul>

                    <h3 className="font-semibold mt-2">2.3 Payment Information</h3>
                    <p>
                        Payments are processed by Razorpay. We do not store your card, UPI, or bank details —
                        Razorpay handles that directly and shares only the payment status and an order/payment
                        reference with us, which we use to activate your plan.
                    </p>

                    <h3 className="font-semibold mt-2">2.4 Support Messages</h3>
                    <p>
                        If you contact us through the support form, we collect the name, email, and message
                        you provide so we can respond to you.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">3. How We Use Your Data</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>To create and maintain your account and keep you signed in</li>
                        <li>To generate tests, grade attempts, and show you performance analytics</li>
                        <li>To process payments and manage your subscription and AI credits</li>
                        <li>To send account-related emails, such as OTP verification and welcome emails</li>
                        <li>To respond to support requests</li>
                        <li>To maintain the security and integrity of the platform</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl mb-2">4. Cookies</h2>
                    <p>
                        We use a single strictly-necessary cookie to keep you signed in. Details of what it
                        stores and how long it lasts are in our{" "}
                        <Link href="/cookie-policy" className="font-bold text-primary underline">
                            Cookie Policy
                        </Link>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">5. Third-Party Services</h2>
                    <p>We rely on the following third-party services, each governed by its own privacy policy:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><span className="font-semibold">Google Sign-In</span> — used for Google account authentication</li>
                        <li><span className="font-semibold">Razorpay</span> — used to process payments for subscriptions and credit top-ups</li>
                        <li><span className="font-semibold">Vercel Analytics</span> — used to understand aggregate, anonymized site traffic</li>
                        <li><span className="font-semibold">Google Fonts</span> — used to load the typefaces used on this site</li>
                    </ul>
                    <p className="mt-2">
                        We do not sell your personal data to third parties, and we only share it with these
                        providers to the extent necessary to operate the platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">6. Data Retention</h2>
                    <p>
                        We retain your account and usage data for as long as your account is active. If you
                        want your account and associated data deleted, contact us and we will action the
                        request, except where we are required to retain certain records by law.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">7. Data Security</h2>
                    <p>
                        We use reasonable technical and organizational measures to protect your data, including
                        password hashing and secure, httpOnly session cookies. No method of transmission or
                        storage is completely secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">8. Your Rights</h2>
                    <p>
                        You can access, correct, or request deletion of your personal data at any time by
                        emailing us. You can also update most of your profile information directly from your
                        account settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">9. Children&apos;s Privacy</h2>
                    <p>
                        Syntropy is intended for students preparing for exams and placements and is not
                        directed at children under 13. We do not knowingly collect personal data from children
                        under 13.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically. Continued use of the platform after a
                        change constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl mb-2">11. Contact</h2>
                    <p>Email: syntropy.tests@gmail.com</p>
                </section>

                <div className="text-sm opacity-60 pt-4 border-t">
                    Last updated: April 2026
                </div>

            </div>
        </div>
    );
}
