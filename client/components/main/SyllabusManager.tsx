"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useState } from "react";
import { FileImage, FileText, Sparkles, Trash2, UploadCloud } from "lucide-react";
import Loader2 from "@/components/utils/Loader2";
import { toast } from "react-toastify";
import DeleteModal from "../modals/DeleteModal";
import SyllabusUpload from "./SyllabusUpload";

type Topic = {
    name: string;
};

type Unit = {
    title: string;
    topics: Topic[];
};

type Subject = {
    name: string;
    units: Unit[];
};

type SyllabusRecord = {
    _id: string;
    title: string;
    subjects: Subject[];
    parsed?: boolean;
};

export default function SyllabusManager() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [syllabus, setSyllabus] = useState<SyllabusRecord | null>(null);
    const [original, setOriginal] = useState<SyllabusRecord | null>(null);
    const [editingSubject, setEditingSubject] = useState<number | null>(null);
    const [fetching, setFetching] = useState(true);
    const [deleteSubjectIndex, setDeleteSubjectIndex] = useState<number | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const fetchSyllabus = useCallback(async () => {
        try {
            setFetching(true);
            const res = await fetch(BACKEND_URL + "/api/syllabus/my", { credentials: "include" });
            const data = await res.json();
            const currentSyllabus = data.syllabus?.[0] || null;
            setSyllabus(currentSyllabus);
            setOriginal(structuredClone(currentSyllabus));
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    }, [BACKEND_URL]);

    useEffect(() => {
        fetchSyllabus();
    }, [fetchSyllabus]);

    const acceptFile = (nextFile: File | null) => {
        if (!nextFile) return;
        setFile(nextFile);
        setDragActive(false);
    };

    const upload = async () => {
        if (!file) {
            return;
        }

        const form = new FormData();
        form.append("file", file);
        setLoading(true);

        try {
            const res = await fetch(BACKEND_URL + "/api/syllabus/upload", {
                method: "POST",
                body: form,
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                toast.warn(data.message || "Syllabus upload failed");
                return;
            }

            toast.success(data.overwritten ? "Syllabus replaced successfully" : "Syllabus uploaded successfully");
            setFile(null);
            await fetchSyllabus();
        } catch (err) {
            console.error(err);
            toast.error("Syllabus upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        acceptFile(event.target.files?.[0] || null);
    };

    const handleDragState = (event: DragEvent<HTMLLabelElement>, active: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(active);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        acceptFile(event.dataTransfer.files?.[0] || null);
    };

    const update = (updated: SyllabusRecord) => {
        setSyllabus(structuredClone(updated));
    };

    const hasChanges =
        JSON.stringify(syllabus?.subjects) !==
        JSON.stringify(original?.subjects);

    const topicsToString = (topics: Topic[]) =>
        topics?.map((topic) => topic.name).join(", ") || "";

    const stringToTopics = (value: string) =>
        value
            .split(",")
            .map((topic) => topic.trim())
            .filter(Boolean)
            .map((topic) => ({ name: topic }));

    const updateSubject = (subjectIndex: number, value: string) => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects[subjectIndex].name = value;
        update(nextSyllabus);
    };

    const removeSubject = (subjectIndex: number) => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects.splice(subjectIndex, 1);
        update(nextSyllabus);
    };

    const updateUnit = (subjectIndex: number, unitIndex: number, value: string) => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects[subjectIndex].units[unitIndex].title = value;
        update(nextSyllabus);
    };

    const removeUnit = (subjectIndex: number, unitIndex: number) => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects[subjectIndex].units.splice(unitIndex, 1);
        update(nextSyllabus);
    };

    const addUnit = (subjectIndex: number) => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects[subjectIndex].units.push({ title: "", topics: [] });
        update(nextSyllabus);
    };

    const addSubject = () => {
        if (!syllabus) return;

        const nextSyllabus = structuredClone(syllabus);
        nextSyllabus.subjects.push({ name: "", units: [] });
        update(nextSyllabus);
    };

    const save = async () => {
        if (!syllabus || !hasChanges) return;

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
            toast.warn(data.message);
            return;
        }

        toast.success("Syllabus update saved");
        setOriginal(structuredClone(syllabus));
    };

    if (fetching) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 />
            </div>
        );
    }

    if (!syllabus) {
        return (
            <SyllabusUpload onUploadSuccess={fetchSyllabus} />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="font-bold">Current uploaded syllabus</p>
                    <p className="mt-1 text-sm opacity-70">{syllabus.title}</p>
                </div>

                <div className="hidden md:flex justify-end">
                    <button onClick={save} disabled={!hasChanges} className={!hasChanges ? "opacity-70 cursor-not-allowed" : ""}>
                        Save syllabus
                    </button>
                </div>
            </div>

            <div className="my-5">
                <p className="mb-3 text-yellow-600 opacity-50 text-sm">Note: Uploading syllabus once again would over-write the current syllabus</p>
                <SyllabusUpload onUploadSuccess={fetchSyllabus} />
            </div>

            {syllabus.subjects.map((subject, subjectIndex) => (
                <div key={subjectIndex} className="mb-5 card">
                    <div className="flex items-center justify-between">
                        {editingSubject === subjectIndex ? (
                            <input
                                value={subject.name}
                                onChange={(e) => updateSubject(subjectIndex, e.target.value)}
                                className="text-lg font-semibold border-b bg-transparent p-0 shadow-none outline-none"
                            />
                        ) : (
                            <h2 className="text-lg font-semibold">
                                {subject.name}
                            </h2>
                        )}

                        <div className="flex items-center gap-3">
                            <button className="button-secondary" onClick={() => setEditingSubject(editingSubject === subjectIndex ? null : subjectIndex)}>
                                {editingSubject === subjectIndex ? "Done" : "Edit Subject"}
                            </button>

                            <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => setDeleteSubjectIndex(subjectIndex)} />
                        </div>
                    </div>

                    <div className="space-y-2 mt-5 flex flex-wrap gap-5">
                        {subject.units.map((unit, unitIndex) => (
                            <div key={unitIndex}>
                                <div className="flex items-center gap-2">
                                    <span>{unitIndex + 1}.</span>

                                    {editingSubject === subjectIndex ? (
                                        <input
                                            value={unit.title}
                                            onChange={(e) => updateUnit(subjectIndex, unitIndex, e.target.value)}
                                            className="border-b mt-3 bg-transparent p-0 shadow-none outline-none"
                                        />
                                    ) : (
                                        <span className="font-semibold">
                                            {unit.title}
                                        </span>
                                    )}

                                    {editingSubject === subjectIndex && (
                                        <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => removeUnit(subjectIndex, unitIndex)} />
                                    )}
                                </div>

                                <div className="ml-5 mt-1">
                                    {editingSubject === subjectIndex ? (
                                        <input
                                            placeholder="Enter topics"
                                            value={topicsToString(unit.topics)}
                                            onChange={(e) => {
                                                if (!syllabus) return;
                                                const nextSyllabus = structuredClone(syllabus);
                                                nextSyllabus.subjects[subjectIndex].units[unitIndex].topics = stringToTopics(e.target.value);
                                                setSyllabus(nextSyllabus);
                                            }}
                                            className="border-b mt-2 bg-transparent p-0 shadow-none outline-none text-sm w-full"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            {topicsToString(unit.topics) || "No topics added yet"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {editingSubject === subjectIndex && (
                            <button className="mt-3" onClick={() => addUnit(subjectIndex)}>
                                + Add Unit
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <button className="button-secondary" onClick={addSubject}>
                + Add Subject
            </button>

            <div className="flex md:hidden w-full mt-5">
                <button onClick={save} disabled={!hasChanges} className={!hasChanges ? "opacity-70 cursor-not-allowed w-full" : "w-full"}>
                    Save syllabus
                </button>
            </div>

            <DeleteModal
                open={deleteSubjectIndex !== null}
                onClose={() => setDeleteSubjectIndex(null)}
                onConfirm={() => {
                    if (deleteSubjectIndex !== null) {
                        removeSubject(deleteSubjectIndex);
                        setDeleteSubjectIndex(null);
                    }
                }}
                title="Delete Subject"
                description="Are you sure you want to delete this subject? This cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
