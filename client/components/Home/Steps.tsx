"use client"

import { useRouter } from "next/navigation";

export default function Steps() {

    const router = useRouter();

    return (
        <div className="py-10 px-5 bg-secondary">
            <p className="text-sm text-center font-bold text-primary mb-7 md:mb-14">
                    GET STARTED EASILY
                </p>
            <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {[
                        {
                            title: "Pick Subjects",
                            desc: "Choose what actually matters. No generic nonsense.",
                        },
                        {
                            title: "Attempt Real Tests",
                            desc: "Timed, structured, slightly uncomfortable. Like it should be.",
                        },
                        {
                            title: "Get Brutal Analysis",
                            desc: "Weak topics, accuracy, time wasted. Nothing hidden.",
                        },
                        {
                            title: "Fix, Repeat, Improve",
                            desc: "Now you’re not guessing anymore.",
                        },
                    ].map((s, i) => (
                        <div
                            key={i}
                            className="border border-black p-6 bg-white relative card"
                        >
                            <span className="absolute -top-3 -left-3 bg-primary text-white text-xs px-2 py-1">
                                STEP {i + 1}
                            </span>
                            <h3 className="font-bold mb-2">{s.title}</h3>
                            <p className="text-sm text-gray-600">{s.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="md:sticky h-full flex flex-col justify-between gap-5 md:gap-0">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                            Studying isn’t the problem.
                            <br />
                            <span className="text-primary">Feedback is.</span>
                        </h2>
                    </div>
                    <div className="text-sm md:text-[1rem]">
                        <p className="text-gray-600 ">
                            You don’t improve by doing more questions. You improve by knowing exactly what you’re doing wrong.
                        </p>
                        <p className="mt-5 md:mt-10 text-gray-600">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem enim impedit, dignissimos voluptatum non accusantium itaque odio adipisci ea ipsum, eum libero laudantium possimus consequuntur dolorem sint sed fugiat. Porro.
                        </p>
                        <p className="mt-5 md:mt-10 text-gray-600">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. In natus maiores provident consequatur ex, minima ducimus reprehenderit sed id, necessitatibus nobis amet molestiae soluta aut quae, non iusto veniam quod.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-full md:w-fit" onClick={() => router.push("/dashboard")}>Start Testing right now</button>
                    </div>
                </div>
            </section>
        </div>
    );
}