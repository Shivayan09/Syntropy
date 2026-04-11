"use client"

import { ArrowBigDown, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {

    const router = useRouter();

    return (
        <section className="mx-auto md:h-screen pt-20 md:pt-10 py-10 px-5 md:px-10 flex flex-col md:flex-row items-center gap-10 md:gap-0">
            <div className="text-left w-full md:w-1/2">
                <p className="text-sm hidden md:flex font-bold text-primary mb-3">
                    MOCK TEST PLATFORM
                </p>

                <h1 className="text-[2.5rem] md:text-6xl text-center md:text-left font-extrabold leading-tight mb-6">
                    Stop Guessing <br /> <span className="text-primary">Start Improving</span>
                </h1>

                <p className="text-lg mb-8 text-center md:text-left text-gray-600 max-w-md">
                    Take subject-based mock tests and get brutally honest analysis of where you actually stand.
                </p>

                <div className="flex items-center justify-center md:justify-start gap-5 text-sm md:text-[1rem]">
                    <button className="w-[90%] md:w-fit" onClick={() => router.push("/main/dashboard")}>Start Testing</button>
                    <button
                        className="button-secondary w-[90%] md:w-fit"
                        onClick={() => router.push("/main/profile")}
                    >
                        Setup Profile
                    </button>
                </div>

                <div className="flex justify-center md:justify-start gap-6 mt-10">
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
                    onClick={() => router.push("/main/dashboard")}
                >
                    View your Analysis
                </button>
            </div>
            <div className="absolute bottom-10 left-1/2 hidden md:flex p-3 bg-secondary rounded-full animate-bounce">
                <ArrowDown className="opacity-70"/>
            </div>
        </section>
    );
}