"use client";

import Link from "next/link";
import { Sparkles, ClipboardPen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateTestPage() {

    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold">Create Test</h1>
                <p className="opacity-70 mt-2">Choose how you want to create your test</p>
            </div>

            {/* Options */}
            <div className="space-y-6">

                {/* AI TEST */}
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Sparkles size={22} />

                        <div>
                            <p className="font-extrabold text-lg">
                                AI Test Generator
                            </p>
                            <p className="text-sm opacity-70">
                                Generate test using difficulty and topics
                            </p>
                        </div>
                    </div>

                    <button className="w-full md:w-32 mt-5 md:mt-0" onClick={() => router.push("/main/create/generate")}>
                        Generate
                    </button>
                </div>

                {/* MANUAL TEST */}
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ClipboardPen size={22} />

                        <div>
                            <p className="font-extrabold text-lg">
                                Manual Test Builder
                            </p>
                            <p className="text-sm opacity-70">
                                Create a custom test with your own questions
                            </p>
                        </div>
                    </div>

                    <button className="w-full md:w-32 mt-5 md:mt-0" onClick={() => router.push("/main/create/manual")}>
                        Create
                    </button>
                </div>

            </div>

            {/* divider */}
            <div className="border-t-2 border-black pt-6">
                <p className="text-sm opacity-70">
                    Tip: Use AI for quick practice, manual for curated tests
                </p>
            </div>
        </div>
    );
}