"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CTA() {
    const router = useRouter();

    return (
        <div className="pb-10 py-10 px-5">
            <div className="text-center mx-auto mb-10">
                <p className="text-sm font-bold text-primary mb-3">
                    START WITH A REAL FLOW
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                    Build your next mock test with <span className="text-primary">actual context</span>
                </h2>
                <p className="text-gray-600 mt-4">
                    Manual creation is unlimited. AI generation starts free and scales with plans when you need more.
                </p>
            </div>
            <section className="max-w-4xl mx-auto text-center">
                <div className="card space-y-6">
                    <div className="grid gap-3 text-left sm:grid-cols-3">
                        {[
                            "Create MCQ and subjective papers",
                            "Generate tests from subjects and difficulty",
                            "Review performance before the next attempt",
                        ].map((item) => (
                            <div key={item} className="border border-black bg-surface p-4 flex gap-3">
                                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <p className="mb-6">
                            If the homepage promises better practice, the next click should take you straight into it.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => router.push("/main/create/generate")}>Generate AI test</button>
                            <button className="button-secondary" onClick={() => router.push("/main/subscription")}>View plans</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
