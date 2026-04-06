"use client"

import { useRouter } from "next/navigation";

export default function CTA() {

    const router = useRouter();

    return (
        <div className="pb-10 py-10 px-5 bg-secondary">
            <div className="text-center mx-auto mb-10">
                <p className="text-sm font-bold text-primary mb-3">
                    TRANSFORMATION
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                    Stop guessing. Start <span className="text-primary">improving</span>
                </h2>
                <p className="text-gray-600 mt-4">
                    Most students think they’re improving. They’re not.
                </p>
            </div>
            <section className="max-w-4xl mx-auto text-center">
                <div className="card">
                    <p className="mb-6">
                        Your weaknesses aren't going to fix themselves.
                    </p>
                    <button onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
                </div>
            </section>
        </div>
    );
}