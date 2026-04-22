"use client";

import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Pen,
  Settings,
  X,
  PanelLeft,
  Trophy,
  Crown,
  Contact,
  Headphones
} from "lucide-react";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import ThemeToggle from "../utils/ThemeToggle";

export default function Sidebar({
  collapsed = false,
  setCollapsed,
}: {
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { getMe } = useAuth();

  const isActive = (path: string) => pathname.startsWith(path);

  const itemClass = (path: string) => `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors  ${isActive(path) ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/5"}`;

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const handleLogout = async () => {
    try {
      await fetch(BACKEND_URL + "/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      await getMe();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-secondary flex items-center px-4 z-50">
        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>

        <p className="ml-5 font-bold text-primary">
          syntropy
        </p>
      </div>

      {/* MOBILE OVERLAY */}
      <div onClick={() => setOpen(false)} className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      {/* MOBILE SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-48 bg-secondary z-50 p-4 flex flex-col justify-between md:hidden transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="absolute bottom-4 right-5">
            <ThemeToggle />
          </div>

          <div className="flex justify-between items-center mb-6">
            <p onClick={() => navigate("/")} className="cursor-pointer font-extrabold text-lg text-primary">
              syntropy
            </p>

            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3 text-sm font-bold">

            <div className={itemClass("/main/dashboard")} onClick={() => router.push("/main/dashboard")}>
              <LayoutDashboard size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Dashboard
              </span>
            </div>

            <div className={itemClass("/main/tests")} onClick={() => router.push("/main/tests")}>
              <BookOpen size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Test Bank
              </span>
            </div>

            <div className={itemClass("/main/create")} onClick={() => router.push("/main/create")}>
              <Pen size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Create test
              </span>
            </div>

            <div className={itemClass("/main/history")} onClick={() => router.push("/main/history")}>
              <History size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                My attempts
              </span>
            </div>

            <div className={itemClass("/main/analytics")} onClick={() => router.push("/main/analytics")}>
              <BarChart3 size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Test Analytics
              </span>
            </div>

            <div className={itemClass("/main/leaderboard")} onClick={() => router.push("/main/leaderboard")}>
              <Trophy size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Leaderboard
              </span>
            </div>

            <div className={itemClass("/main/subscription")} onClick={() => router.push("/main/subscription")}>
              <Crown size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Subscription
              </span>
            </div>

            <div className={itemClass("/main/profile")} onClick={() => navigate("/main/profile")}>
              <Settings size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                My Account
              </span>
            </div>

            <div className={itemClass("/main/support")} onClick={() => navigate("/main/support")}>
              <Headphones size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Contact Us
              </span>
            </div>

          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold cursor-pointer px-3 py-2 rounded-lg" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex relative h-screen bg-secondary flex-col justify-between transition-all duration-300 ease-in-out ${collapsed ? "w-18 px-2" : "w-50 px-3"} py-6`}>

        <div className={`absolute  ${collapsed ? 'bottom-20 right-5.5' : 'bottom-6.5 right-1'}`}>
          <ThemeToggle />
        </div>
        <div>
          {setCollapsed && (
            <div onClick={() => setCollapsed(!collapsed)} className="absolute top-7 right-3 cursor-pointer">
              <PanelLeft size={20} />
            </div>
          )}

          {!collapsed && <div className="flex items-center gap-1 mb-7 ml-2">
            <img src="/logo.png" className="h-7" />

            <span onClick={() => router.push('/')} className={`cursor-pointer font-extrabold text-primary text-xl whitespace-nowrap transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
              syntropy
            </span>
          </div>}

          <nav className={`space-y-3 text-sm font-bold ${collapsed && 'mt-14'}`}>

            <div className={itemClass("/main/dashboard")} onClick={() => router.push("/main/dashboard")}>
              <LayoutDashboard size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Dashboard
              </span>
            </div>

            <div className={itemClass("/main/tests")} onClick={() => router.push("/main/tests")}>
              <BookOpen size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Test Bank
              </span>
            </div>

            <div className={itemClass("/main/create")} onClick={() => router.push("/main/create")}>
              <Pen size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Create test
              </span>
            </div>

            <div className={itemClass("/main/history")} onClick={() => router.push("/main/history")}>
              <History size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                My attempts
              </span>
            </div>

            <div className={itemClass("/main/analytics")} onClick={() => router.push("/main/analytics")}>
              <BarChart3 size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Test Analytics
              </span>
            </div>

            <div className={itemClass("/main/leaderboard")} onClick={() => router.push("/main/leaderboard")}>
              <Trophy size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Leaderboard
              </span>
            </div>

            <div className={itemClass("/main/subscription")} onClick={() => router.push("/main/subscription")}>
              <Crown size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Subscription
              </span>
            </div>

            <div className={itemClass("/main/profile")} onClick={() => navigate("/main/profile")}>
              <Settings size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                My Account
              </span>
            </div>

            <div className={itemClass("/main/support")} onClick={() => navigate("/main/support")}>
              <Headphones size={18} />
              <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                Contact Us
              </span>
            </div>

          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold cursor-pointer px-3 py-2 rounded-lg" onClick={handleLogout}>
          <LogOut size={18} />
          <span className={`transition-all duration-200 whitespace-nowrap ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Logout
          </span>
        </div>

      </aside>
    </>
  );
}