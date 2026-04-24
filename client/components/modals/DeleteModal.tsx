"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type DeleteModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    loading?: boolean;
};

export default function DeleteModal({
    open,
    onClose,
    onConfirm,
    title = "Delete",
    description = "Are you sure you want to delete this?",
    confirmText = "Delete",
    loading = false,
}: DeleteModalProps) {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-md bg-surface border border-primary shadow-lg p-6 rounded-lg" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-3 right-3">
                    <X className="cursor-pointer hover:opacity-70" onClick={onClose} />
                </div>
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-sm opacity-70 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button className="button-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>

                    <button onClick={onConfirm} disabled={loading} className={`${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
                        {loading ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
