"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import { FileImage, FileText, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
    onUploadSuccess: () => Promise<void>;
    variant?: "empty" | "replace";
};

export default function SyllabusUpload({ onUploadSuccess, variant = "empty" }: Props) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const acceptFile = (nextFile: File | null) => {
        if (!nextFile) return;
        setFile(nextFile);
        setDragActive(false);
    };

    const upload = async () => {
        if (!file) return;
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
                toast.warn(data.message || "Upload failed");
                return;
            }
            toast.success(data.overwritten ? "Syllabus replaced" : "Syllabus uploaded");
            setFile(null);
            await onUploadSuccess();
        } catch {
            toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        acceptFile(e.target.files?.[0] || null);
    };

    const handleDragState = (e: DragEvent<HTMLLabelElement>, active: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(active);
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        acceptFile(e.dataTransfer.files?.[0] || null);
    };

    return (
        <div className="space-y-4">
            <label
                onDragEnter={(e) => handleDragState(e, true)}
                onDragOver={(e) => handleDragState(e, true)}
                onDragLeave={(e) => handleDragState(e, false)}
                onDrop={handleDrop}
                className={`block cursor-pointer border-2 border-dashed border-green-600 p-5 transition ${dragActive ? "bg-primary text-white" : "bg-(--surface)"}`}>

                <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />

                <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center border bg-(--bg-secondary)">
                        {loading ? <Sparkles className="animate-pulse" /> : <UploadCloud />}
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase">
                            {variant === "replace" ? "Replace upload" : "Upload syllabus"}
                        </p>
                        <h3 className="text-xl font-extrabold">
                            Drop file or browse
                        </h3>

                        <div className="mt-2 flex gap-2 text-xs font-bold uppercase">
                            <span className="border px-3 py-1 flex items-center gap-2">
                                <FileText size={14} /> PDF
                            </span>
                            <span className="border px-3 py-1 flex items-center gap-2">
                                <FileImage size={14} /> Image
                            </span>
                        </div>
                    </div>
                </div>
            </label>

            {file && (
                <div className="border p-3">
                    <p className="text-sm">{file.name}</p>
                </div>
            )}

            <button onClick={upload} disabled={!file || loading} className={!file || loading ? "opacity-70 cursor-not-allowed" : ""}>
                {loading ? "Uploading..." : "Upload syllabus"}
            </button>
        </div>
    );
}