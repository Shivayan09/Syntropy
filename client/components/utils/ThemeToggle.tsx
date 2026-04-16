"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setDark(isDark);
    }, []);

    const toggle = () => {
        const root = document.documentElement;

        if (root.classList.contains("dark")) {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setDark(false);
        } else {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setDark(true);
        }
    };

    return (
        <div
            onClick={toggle}
            className="cursor-pointer px-3 py-2 text-(--text) flex items-center justify-center transition-all select-none"
        >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
        </div>
    );
}