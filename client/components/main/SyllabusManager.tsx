"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Loader2 from "@/components/Loader2";
import { toast } from "react-toastify";

export default function SyllabusManager() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [syllabus, setSyllabus] = useState<any>(null);
    const [original, setOriginal] = useState<any>(null);
    const [editingSubject, setEditingSubject] = useState<number | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            setFetching(true);
            const res = await fetch(BACKEND_URL + "/api/syllabus/my", {
                credentials: "include",
            });
            const data = await res.json();
            const s = data.syllabus?.[0] || null;
            setSyllabus(s);
            setOriginal(structuredClone(s));
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
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


    const updateSubject = (si: number, val: string) => {
        const s = structuredClone(syllabus);
        s.subjects[si].name = val;
        update(s);
    }

    const removeSubject = (si: number) => {
        const s = structuredClone(syllabus);
        s.subjects.splice(si, 1);
        update(s);
    }

    const updateUnit = (si: number, ui: number, val: string) => {
        const s = structuredClone(syllabus);
        s.subjects[si].units[ui].title = val;
        update(s);
    }

    const removeUnit = (si: number, ui: number) => {
        const s = structuredClone(syllabus);
        s.subjects[si].units.splice(ui, 1);
        update(s);
    }

    const addUnit = (si: number) => {
        const s = structuredClone(syllabus);
        s.subjects[si].units.push({ title: "", topics: [] });
        update(s);
    }

    const addSubject = () => {
        const s = structuredClone(syllabus);
        s.subjects.push({ name: "", units: [] });
        update(s);
    }

    const save = async () => {
        if (!hasChanges) return;
        const res = await fetch(BACKEND_URL + "/api/syllabus/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                _id: syllabus._id,
                subjects: syllabus.subjects,
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            toast.warn(data.message)
        } else {
            toast.success("Syllabus update saved");
        }
        setOriginal(structuredClone(syllabus));
    }

    if (fetching) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 />
            </div>
        );
    }

    if (!syllabus) {
        return (
            <div>
                <p className="text-gray-500 mb-3">
                    No syllabus! Add it here:
                </p>

                <div className="flex items-center gap-5">
                    <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) =>
                            setFile(e.target.files?.[0] || null)
                        }
                    />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={upload}
                            disabled={!file || loading}
                        >
                            Upload Syllabus
                        </button>

                        {file && (
                            <span className="text-sm opacity-70">
                                {file.name}
                            </span>
                        )}
                    </div>
                </div>

                {loading && <Loader2 />}
            </div>
        );
    }

    return (
        <div>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
                <p className="font-bold">
                    Current uploaded syllabus
                </p>

                <div className="hidden md:flex justify-end">
                    <button
                        onClick={save}
                        disabled={!hasChanges}
                        className={
                            !hasChanges
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                        }
                    >
                        Save syllabus
                    </button>
                </div>
            </div>

            {/* SUBJECTS */}
            {syllabus.subjects.map((sub: any, si: number) => (
                <div key={si} className="mb-5 card">

                    {/* SUBJECT HEADER */}
                    <div className="flex items-center justify-between">

                        {editingSubject === si ? (
                            <input
                                value={sub.name}
                                onChange={(e) =>
                                    updateSubject(si, e.target.value)
                                }
                                className="text-lg font-semibold border-b bg-transparent p-0 shadow-none outline-none"
                            />
                        ) : (
                            <h2 className="text-lg font-semibold">
                                {sub.name}
                            </h2>
                        )}

                        <div className="flex items-center gap-3">

                            <button
                                className="button-secondary"
                                onClick={() =>
                                    setEditingSubject(
                                        editingSubject === si ? null : si
                                    )
                                }
                            >
                                {editingSubject === si
                                    ? "Done"
                                    : "Edit Subject"}
                            </button>

                            <Trash2
                                size={16}
                                className="text-red-500 cursor-pointer"
                                onClick={() => removeSubject(si)}
                            />
                        </div>
                    </div>

                    {/* UNITS */}
                    <div className="space-y-2 mt-5 flex flex-wrap gap-5">

                        {sub.units.map((unit: any, ui: number) => (
                            <div key={ui}>

                                <div className="flex items-center gap-2">
                                    <span>{ui + 1}.</span>

                                    {editingSubject === si ? (
                                        <input
                                            value={unit.title}
                                            onChange={(e) =>
                                                updateUnit(
                                                    si,
                                                    ui,
                                                    e.target.value
                                                )
                                            }
                                            className="border-b mt-3 bg-transparent p-0 shadow-none outline-none"
                                        />
                                    ) : (
                                        <span className="font-semibold">
                                            {unit.title}
                                        </span>
                                    )}

                                    {editingSubject === si && (
                                        <Trash2
                                            size={14}
                                            className="text-red-500 cursor-pointer"
                                            onClick={() =>
                                                removeUnit(si, ui)
                                            }
                                        />
                                    )}
                                </div>

                                {/* TOPICS */}
                                <div className="ml-5 mt-1">

                                    {editingSubject === si ? (
                                        <input
                                            placeholder="Enter topics"
                                            value={topicsToString(
                                                unit.topics
                                            )}
                                            onChange={(e) => {
                                                const s =
                                                    structuredClone(
                                                        syllabus
                                                    );
                                                s.subjects[si].units[
                                                    ui
                                                ].topics =
                                                    stringToTopics(
                                                        e.target.value
                                                    );
                                                setSyllabus(s);
                                            }}
                                            className="border-b mt-2 bg-transparent p-0 shadow-none outline-none text-sm w-full"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            {topicsToString(
                                                unit.topics
                                            ) ||
                                                "No topics added yet"}
                                        </span>
                                    )}
                                </div>

                            </div>
                        ))}

                        {/* ADD UNIT */}
                        {editingSubject === si && (
                            <button
                                className="mt-3"
                                onClick={() => addUnit(si)}
                            >
                                + Add Unit
                            </button>
                        )}
                    </div>

                </div>
            ))}

            {/* ADD SUBJECT */}
            <button
                className="button-secondary"
                onClick={addSubject}
            >
                + Add Subject
            </button>

            {/* MOBILE SAVE */}
            <div className="flex md:hidden w-full mt-5">
                <button
                    onClick={save}
                    disabled={!hasChanges}
                    className={
                        !hasChanges
                            ? "opacity-70 cursor-not-allowed w-full"
                            : "w-full"
                    }
                >
                    Save syllabus
                </button>
            </div>
        </div>
    );
}