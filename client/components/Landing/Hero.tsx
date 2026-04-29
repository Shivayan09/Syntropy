"use client";

import Image from "next/image";
import { ArrowDown, BookOpenCheck, ClipboardList, TimerReset, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();

    return (
        <section className="mx-auto md:h-screen pt-20 md:pt-10 py-10 px-5 md:px-10 flex flex-col md:flex-row items-center gap-10 md:gap-0">
            <div className="text-left w-full md:w-1/2">
                <p className="text-sm hidden md:flex font-bold text-primary mb-3">
                    SYLLABUS-AWARE MOCK TEST PLATFORM
                </p>

                <h1 className="text-[2.3rem] md:text-6xl text-center md:text-left font-extrabold leading-tight mb-6">
                    Practice smarter
                    <br />
                    <span className="text-primary md:text-7xl">Perform better</span>
                </h1>

                <p className="text-lg mb-8 text-center md:text-left text-gray-600 max-w-xl">
                    Create manual papers or generate AI mock tests from your real subjects, attempt them on a timer, and turn every result into a clearer study plan.
                </p>

                <div className="flex items-center justify-center md:justify-start gap-5 text-sm md:text-[1rem]">
                    <button className="w-[90%] md:w-fit" onClick={() => router.push("/main/tests")}>
                        Explore Tests
                    </button>
                    <button
                        className="button-secondary w-[90%] md:w-fit"
                        onClick={() => router.push("/main/create/generate")}
                    >
                        Generate With AI
                    </button>
                </div>

                <div className="hidden md:flex justify-center md:justify-start gap-6 mt-10">
                    <div>
                        <p className="text-lg opacity-70 font-bold">Manual and AI</p>
                        <p className="text-sm text-gray-600">Two ways to build tests</p>
                    </div>
                    <div>
                        <p className="text-lg opacity-70 font-bold">Timed tests</p>
                        <p className="text-sm text-gray-600">Real attempt experience</p>
                    </div>
                    <div>
                        <p className="text-lg opacity-70 font-bold">Tracked performance</p>
                        <p className="text-sm text-gray-600">Review, analytics, leaderboard</p>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 space-y-5">
                <div className="logo-img w-full h-140" />
            </div>
            <div className="absolute bottom-10 left-1/2 hidden md:flex p-3 bg-secondary rounded-full animate-bounce">
                <ArrowDown className="opacity-70" />
            </div>
        </section>
    );
}
