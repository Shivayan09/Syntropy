"use client"

import { useRouter } from "next/navigation";

export default function Hero() {

    const router = useRouter();

    return (
        <section className="mx-auto md:h-[85vh] py-10 md:px-10 flex flex-col md:flex-row items-center gap-10 md:gap-0">
            <div className="text-left w-full md:w-1/2">
                <p className="text-sm font-bold text-primary mb-3">
                    MOCK TEST PLATFORM
                </p>

                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                    Stop Guessing <br/> <span className="text-primary">Start Improving</span>
                </h1>

                <p className="text-lg mb-8 text-gray-600 max-w-md">
                    Take subject-based mock tests and get brutally honest analysis of where you actually stand.
                </p>

                <div className="flex gap-4 text-sm md:text-[1rem]">
                    <button onClick={() => router.push("/dashboard")}>Start Testing</button>
                    <button
                        className="button-secondary"
                        onClick={() => router.push("/profile")}
                    >
                        Setup Profile
                    </button>
                </div>

                <div className="flex gap-6 mt-10">
                    <div>
                        <p className="text-2xl font-bold">10K+</p>
                        <p className="text-sm text-gray-600">Tests Taken</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">500+</p>
                        <p className="text-sm text-gray-600">Students</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">95%</p>
                        <p className="text-sm text-gray-600">Improvement</p>
                    </div>
                </div>
            </div>

            <div className="card bg-surface w-full md:w-1/2">
                <h3 className="font-bold mb-4">Latest Performance</h3>

                <div className="space-y-4">
                    {[
                        { name: "DSA", val: 72 },
                        { name: "DBMS", val: 54 },
                        { name: "OS", val: 81 },
                    ].map((item) => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{item.name}</span>
                                <span>{item.val}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full">
                                <div
                                    className="h-2 bg-primary rounded-full"
                                    style={{ width: `${item.val}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="mt-6 w-full"
                    onClick={() => router.push("/dashboard")}
                >
                    View Full Analysis
                </button>
            </div>
        </section>
    );
}