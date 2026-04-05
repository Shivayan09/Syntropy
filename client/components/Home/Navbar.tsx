"use client"

export default function Navbar() {
    return(
        <div className="border-b border-black/10 px-10 py-3 flex items-center justify-between">
            <div className="font-bold text-xl cursor-pointer text-primary flex items-center gap-1">
                <img src="/logo.png" alt="" className="h-7"/>
                <p>Testify</p>
            </div>
            <div className="flex items-center gap-10">
                <p className="cursor-pointer hover:text-black/70 transition-all duration-200">Home</p>
                <p className="cursor-pointer hover:text-black/70 transition-all duration-200">Tests</p>
                <p className="cursor-pointer hover:text-black/70 transition-all duration-200">Dashboard</p>
                <p className="cursor-pointer hover:text-black/70 transition-all duration-200">Analysis</p>
                <p className="cursor-pointer hover:text-black/70 transition-all duration-200">Contact</p>
            </div>
            <div>
                <button>
                    Sign in
                </button>
            </div>
        </div>
    );
}