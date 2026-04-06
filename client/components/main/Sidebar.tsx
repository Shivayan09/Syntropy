"use client";

import { BarChart3, BookOpen, LayoutDashboard, LogOut, Menu, User2, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  const itemClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
     ${isActive(path)
      ? "bg-primary text-white"
      : "hover:bg-stone-100"
    }`;

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const handleLogout = async () => {
    try {
      await fetch(BACKEND_URL + "/api/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white flex items-center px-4 z-50">
        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>

        <p className="ml-5 font-bold text-primary">
          TESTIFY
        </p>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      <div onClick={() => setOpen(false)} className={` fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={` fixed top-0 left-0 h-screen w-48 bg-white z-50 p-4 flex flex-col justify-between md:hidden transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <p onClick={() => navigate("/")} className="cursor-pointer font-extrabold text-lg text-primary">
              TESTIFY
            </p>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3 text-sm font-bold">

            <div className={itemClass("/main/dashboard")} onClick={() => navigate("/main/dashboard")}>
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div className={itemClass("/main/test")} onClick={() => navigate("/main/test")}>
              <BookOpen size={18} />
              Tests
            </div>

            <div className={itemClass("/main/analytics")} onClick={() => navigate("/main/analytics")}>
              <BarChart3 size={18} />
              Analytics
            </div>

            <div className={itemClass("/main/profile")} onClick={() => navigate("/main/profile")}>
              <User2 size={18} />
              Profile
            </div>

          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold cursor-pointer px-3 py-2 bg-stone-100 rounded-lg" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </div>
      </aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-54 h-screen bg-white py-6 px-3 flex-col justify-between">

        <div>
          <div className="flex items-center gap-1 mb-7 ml-2">
            <img src="/logo.png" alt="" className="h-7" />
            <p onClick={() => router.push("/")} className="cursor-pointer font-extrabold text-lg text-primary">
              TESTIFY
            </p>
          </div>

          <nav className="space-y-3 text-sm font-bold">

            <div className={itemClass("/main/dashboard")} onClick={() => router.push("/main/dashboard")}>
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div className={itemClass("/main/test")} onClick={() => router.push("/main/test")}>
              <BookOpen size={18} />
              Tests
            </div>

            <div className={itemClass("/main/analytics")} onClick={() => router.push("/main/analytics")}>
              <BarChart3 size={18} />
              Analytics
            </div>

            <div className={itemClass("/main/profile")} onClick={() => navigate("/main/profile")}>
              <User2 size={18} />
              Profile
            </div>

          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold cursor-pointer px-3 py-2 bg-stone-100 rounded-lg" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </div>

      </aside>
    </>
  );
}