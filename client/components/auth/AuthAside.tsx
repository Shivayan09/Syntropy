import Image from "next/image";
import { FilePenLine, FileUp, LineChart, Timer } from "lucide-react";

const steps = [
    {
        icon: FileUp,
        title: "Start from your syllabus",
        desc: "Your subjects and units, parsed once and reused everywhere.",
    },
    {
        icon: FilePenLine,
        title: "Build it or generate it",
        desc: "Write MCQ and subjective papers yourself, or let AI draft them.",
    },
    {
        icon: Timer,
        title: "Attempt it on the clock",
        desc: "Palette navigation, review flags, countdown-based submission.",
    },
    {
        icon: LineChart,
        title: "See exactly what to fix",
        desc: "Analytics, weak-topic detection, and history after every attempt.",
    },
];

const copy = {
    login: {
        eyebrow: "SYLLABUS-AWARE MOCK TESTS",
        heading: ["Stop guessing", "Start improving"],
        sub: "Most students practice blindly. syntropy shows you exactly where you stand and what to fix next.",
    },
    register: {
        eyebrow: "SET UP IN A FEW MINUTES",
        heading: ["Practice smarter", "Perform better"],
        sub: "Turn your real coursework into timed mock tests, then turn every result into a clearer study plan.",
    },
};

export default function AuthAside({ variant }: { variant: keyof typeof copy }) {
    const { eyebrow, heading, sub } = copy[variant];

    return (
        <aside className="relative hidden md:flex w-[55%] shrink-0 flex-col justify-center overflow-hidden bg-secondary px-10 py-8 lg:px-14">

            {/* Ambient wash */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 -left-24 h-112 w-md rounded-full bg-[radial-gradient(circle,rgba(0,168,90,0.20),transparent_65%)] blur-2xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-48 -right-24 h-128 w-lg rounded-full bg-[radial-gradient(circle,rgba(0,255,170,0.14),transparent_65%)] blur-2xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 text-white/8bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />

            <div className="relative w-full max-w-xl">

                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Syntropy logo" width={28} height={28} className="h-7 w-auto" />
                    <p className="text-sm font-bold text-primary">syntropy</p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(0,168,90,0.22)] bg-surface px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-primary backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {eyebrow}
                </span>

                <h1 className="mt-4 text-[2.35rem] font-extrabold leading-[1.08] lg:text-[2.75rem]">
                    {heading[0]}
                    <br />
                    <span className="text-primary">{heading[1]}</span>
                </h1>

                <p className="mt-3 max-w-md text-[0.925rem] leading-relaxed opacity-70">
                    {sub}
                </p>

                {/* Practice loop */}
                <ol className="relative mt-7 space-y-7">
                    <span
                        aria-hidden="true"
                        className="absolute left-4.75 top-3 bottom-3 w-px bg-linear-to-b from-transparent via-[rgba(0,168,90,0.35)] to-transparent"
                    />
                    {steps.map((step) => (
                        <li key={step.title} className="relative flex items-start gap-4">
                            <span className="grid h-9.5 w-9.5 shrink-0 place-items-center rounded-xl border border-[rgba(0,168,90,0.22)] bg-surface text-primary shadow-(--shadow-sm) backdrop-blur-md">
                                <step.icon size={17} />
                            </span>
                            <div>
                                <p className="font-bold leading-snug">{step.title}</p>
                                <p className="mt-0.5 text-sm leading-snug opacity-60">{step.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </aside>
    );
}
