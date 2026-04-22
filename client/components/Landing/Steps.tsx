"use client";

import { FilePenLine, FileUp, LineChart, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Steps() {
    const router = useRouter();

    return (
        <div className="py-10 px-5 bg-secondary">
            <p className="text-sm text-center font-bold text-primary mb-7 md:mb-14">
                HOW IT WORKS
            </p>
            <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {[
                        {
                            title: "Upload your syllabus or finish onboarding",
                            desc: "Bring in your subjects, semester context, and preferences so practice starts from your real coursework.",
                            icon: FileUp,
                        },
                        {
                            title: "Create a manual paper or generate one with AI",
                            desc: "Build MCQ or subjective tests with full control, or let AI create them from selected subjects and difficulty.",
                            icon: FilePenLine,
                        },
                        {
                            title: "Attempt it in a real timed environment",
                            desc: "Use palette navigation, review flags, answer clearing, and countdown-based submission like an actual test window.",
                            icon: Timer,
                        },
                        {
                            title: "Review results and decide the next move",
                            desc: "Use attempt history, analytics, weak-topic detection, and leaderboard results to know what to fix next.",
                            icon: LineChart,
                        },
                    ].map((step, i) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="border border-black p-6 relative card"
                            >
                                <span className="absolute -top-3 -left-3 bg-primary text-white text-xs px-2 py-1">
                                    STEP {i + 1}
                                </span>
                                <h3 className="font-bold mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600">{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="md:sticky h-full flex flex-col justify-between gap-5 md:gap-0">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                            Practicing is easy.
                            <br />
                            <span className="text-primary">Practicing the right way is harder.</span>
                        </h2>
                    </div>
                    <div className="text-sm md:text-[1rem]">
                        <p className="text-gray-600">
                            Syntropy is built for the gap between random question solving and exam-ready performance. It gives you structure, timing pressure, and feedback that actually compounds.
                        </p>
                        <p className="mt-5 md:mt-10 text-gray-600">
                            Instead of one-off quizzes, you get a full loop: create papers, attempt them properly, review outcomes, spot weak subjects or topics, and come back with a clearer plan.
                        </p>
                        <p className="mt-5 md:mt-10 text-gray-600">
                            That makes it useful for semester exams, placement prep, and any study flow where confidence should come from evidence, not just volume.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-full md:w-fit" onClick={() => router.push("/main/create/manual")}>
                            Create your first paper
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
