"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const nav = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const { user, loading } = useAuth();

  return (
    <>
      {/* ================= MOBILE NAVBAR ================= */}
      <div className="md:hidden border-b fixed z-50 w-full bg-(--surface)/80 backdrop-blur-lg border-black/10 px-4 py-3 flex items-center justify-between">

        <div onClick={() => nav("/")} className="font-extrabold text-lg text-primary flex items-center gap-1">
          <img src="/logo.png" className="h-6" />
          TESTIFY
        </div>

        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <div onClick={() => setOpen(false)} className={` md:hidden fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"} `} />

      {/* MOBILE MENU */}
      <div className={` md:hidden fixed top-0 right-0 h-screen w-64 bg-secondary z-50 p-6 transform transition-transform duration-300 ease-out flex flex-col justify-between ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div>
          <div className="absolute top-7 left-5">
            <ThemeToggle />
          </div>
          <div className="flex justify-end mb-8">
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-6 font-semibold">
            <p onClick={() => nav("/")}>Home</p>
            <p onClick={() => nav("/tests")}>Tests</p>
            <p onClick={() => nav("/main/dashboard")}>Dashboard</p>
            <p onClick={() => nav("/main/analytics")}>Analysis</p>
            <p>Contact</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <button className="w-full" onClick={() => nav("/auth/login")}>
            Sign in
          </button>
        </div>
      </div>

      {/* ================= DESKTOP NAVBAR ================= */}
      <div className="hidden md:flex border-b fixed z-50 w-full bg-(--surface)/80 backdrop-blur-lg border-black/10 px-10 py-3 items-center justify-between">

        <div onClick={() => nav("/")} className="font-extrabold cursor-pointer text-primary flex items-center gap-1">
          <img src="/logo.png" className="h-7" />
          TESTIFY
        </div>

        <div className="flex items-center gap-10">
          <p onClick={() => nav("/")} className="cursor-pointer hover:opacity-65">Home</p>
          <p onClick={() => nav("/main/test")} className="cursor-pointer hover:opacity-65">Tests</p>
          <p onClick={() => nav("/main/dashboard")} className="cursor-pointer hover:opacity-65">Dashboard</p>
          <p onClick={() => nav("/main/analytics")} className="cursor-pointer hover:opacity-65">Analysis</p>
          <p className="cursor-pointer hover:text-black/70">Contact</p>
        </div>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          {!user &&
            <button onClick={() => nav("/auth/login")}>
              Sign out
            </button>}
        </div>

      </div>
    </>
  );
}