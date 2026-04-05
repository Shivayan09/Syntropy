"use client"

import { useRouter } from "next/navigation";

export default function CTA() {

    const router = useRouter();

    return (
        <div className="py-10">
            <section className="max-w-4xl mx-auto text-center">
                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">
                        Stop procrastinating. Start improving.
                    </h2>
                    <p className="mb-6">
                        Your weaknesses aren't going to fix themselves.
                    </p>
                    <button onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
                </div>
            </section>
        </div>
    );
}