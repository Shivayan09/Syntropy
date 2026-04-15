"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Loader2 from "@/components/Loader2";

export default function SyllabusManager() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [syllabus, setSyllabus] = useState<any>(null);
    const [original, setOriginal] = useState<any>(null);

    const [editing, setEditing] = useState<any>({
        subject: null,
        unit: null,
        topic: null,
    });

    const [topicInput, setTopicInput] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        const res = await fetch(BACKEND_URL + "/api/syllabus/my", { credentials: "include" });
        const data = await res.json();
        const s = data.syllabus?.[0] || null;
        setSyllabus(s);
        setOriginal(structuredClone(s));
    };

    const upload = async () => {
        if (!file) {
            return;
        }
        const form = new FormData();
        form.append("file", file);
        setLoading(true);
        try {
            await fetch(BACKEND_URL + "/api/syllabus/upload", {
                method: "POST",
                body: form,
                credentials: "include",
            });
            setFile(null);
            fetchSyllabus();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const update = (updated: any) => {
        setSyllabus(structuredClone(updated));
    };

    const hasChanges = JSON.stringify(syllabus?.subjects) !== JSON.stringify(original?.subjects);

    const topicsToString = (topics: any[]) => topics?.map((t) => t.name).join(", ") || "";

    const stringToTopics = (value: string) => value.split(",").map((t) => t.trim()).filter(Boolean).map((t) => ({ name: t }));

    if (!syllabus) {
        return (
            <div>
                <p className="text-gray-500 mb-3">No syllabus! Add it here:</p>
                <div className="flex items-center gap-5">
                    <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)}/>

                    <div className="flex items-center gap-3">
                        <button onClick={upload} disabled={!file || loading}>
                            Upload Syllabus
                        </button>

                        {file && (
                            <span className="text-sm opacity-70">{file.name}</span>
                        )}
                    </div>
                </div>

                {loading && <Loader2 />}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <p className="font-bold">Current uploaded syllabus</p>
                <div className="hidden md:flex justify-end">
                    <button onClick={save} disabled={!hasChanges} className={!hasChanges ? "opacity-70 cursor-not-allowed" : ""}>
                        Save syllabus
                    </button>
                </div>
            </div>

            {syllabus.subjects.map((sub: any, si: number) => (
                <div key={si} className="mb-5 card">

                    <div className="flex items-center gap-3">
                        {editing.subject === si ? (
                            <input value={sub.name} onChange={(e) => updateSubject(si, e.target.value)} onBlur={() => setEditing({})} className="text-lg font-semibold border-b bg-transparent p-0 shadow-none outline-none"/>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold">{sub.name}</h2>
                                <Pencil size={14} className="text-primary cursor-pointer" onClick={() => setEditing({ subject: si })} />
                                <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => removeSubject(si)} />
                            </>
                        )}
                    </div>

                    <div className="ml-4 space-y-2 mt-2">
                        {sub.units.map((unit: any, ui: number) => {
                            const isEditingUnit = editing.unit === `${si}-${ui}`;
                            const isEditingTopics = editing.topic === `${si}-${ui}`;

                            return (
                                <div key={ui}>

                                    <div className="flex items-center gap-2">
                                        <span>{ui + 1}.</span>

                                        {isEditingUnit ? (
                                            <input
                                                value={unit.title}
                                                onChange={(e) =>
                                                    updateUnit(si, ui, e.target.value)
                                                }
                                                onBlur={() => setEditing({})}
                                                className="border-b bg-transparent p-0 shadow-none outline-none"
                                            />
                                        ) : (
                                            <>
                                                <span className="font-semibold">{unit.title}</span>

                                                <span className="text-primary cursor-pointer text-xs" onClick={() => setEditing({ unit: `${si}-${ui}` }) } >
                                                    edit
                                                </span>

                                                <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => removeUnit(si, ui)}/>
                                            </>
                                        )}
                                    </div>

                                    {/* TOPICS */}
                                    <div className="ml-6 mt-1">
                                        {isEditingTopics ? (
                                            <input
                                                value={
                                                    topicInput[`${si}-${ui}`] ??
                                                    topicsToString(unit.topics)
                                                }
                                                onChange={(e) =>
                                                    setTopicInput((prev) => ({
                                                        ...prev,
                                                        [`${si}-${ui}`]: e.target.value,
                                                    }))
                                                }
                                                onBlur={() => {
                                                    const value =
                                                        topicInput[`${si}-${ui}`] ??
                                                        topicsToString(unit.topics);

                                                    const s = structuredClone(syllabus);
                                                    s.subjects[si].units[ui].topics =
                                                        stringToTopics(value);

                                                    setSyllabus(s);
                                                    setEditing({});
                                                }}
                                                className="border-b bg-transparent p-0 shadow-none outline-none text-sm w-full"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm text-gray-500">
                                                    {topicsToString(unit.topics) || "No topics added yet"}
                                                </span>

                                                <span
                                                    className="text-primary cursor-pointer text-xs"
                                                    onClick={() =>
                                                        setEditing({ topic: `${si}-${ui}` })
                                                    }
                                                >
                                                    edit
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}

                        <button className="mt-3" onClick={() => addUnit(si)}>
                            + Add Unit
                        </button>
                    </div>

                </div>
            ))}

            <button className="button-secondary" onClick={addSubject}>+ Add Subject</button>

            <div className="flex md:hidden w-full mt-5">
                <button onClick={save} disabled={!hasChanges} className={!hasChanges ? "opacity-70 cursor-not-allowed w-full" : " w-full"}>
                    Save syllabus
                </button>
            </div>
        </div>

    );

    function updateSubject(si: number, val: string) {
        const s = structuredClone(syllabus);
        s.subjects[si].name = val;
        update(s);
    }

    function removeSubject(si: number) {
        const s = structuredClone(syllabus);
        s.subjects.splice(si, 1);
        update(s);
    }

    function updateUnit(si: number, ui: number, val: string) {
        const s = structuredClone(syllabus);
        s.subjects[si].units[ui].title = val;
        update(s);
    }

    function removeUnit(si: number, ui: number) {
        const s = structuredClone(syllabus);
        s.subjects[si].units.splice(ui, 1);
        update(s);
    }

    function addUnit(si: number) {
        const s = structuredClone(syllabus);
        s.subjects[si].units.push({ title: "", topics: [] });
        update(s);
    }

    function addSubject() {
        const s = structuredClone(syllabus);
        s.subjects.push({ name: "", units: [] });
        update(s);
    }

    async function save() {
        if (!hasChanges) return;

        await fetch(BACKEND_URL + "/api/syllabus/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                _id: syllabus._id,
                subjects: syllabus.subjects,
            }),
        });

        setOriginal(structuredClone(syllabus));
    }
}