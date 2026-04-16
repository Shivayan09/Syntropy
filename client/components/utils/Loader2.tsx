"use client";

export default function Loader2() {
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-6">

        {/* bouncing blocks */}
        <div className="flex gap-3">
          <div className="loader-block" />
          <div className="loader-block delay-150" />
          <div className="loader-block delay-300" />
        </div>

        <p className="font-bold tracking-wide text-sm opacity-80">
          Loading
        </p>
      </div>

      <style jsx>{`
        .loader-block {
          width: 28px;
          height: 28px;
          background: var(--primary);
          border: var(--border-width) solid black;
          box-shadow: var(--shadow-offset) var(--shadow-offset) 0 black;
          animation: bounce 0.9s infinite ease-in-out;
        }

        .delay-150 {
          animation-delay: 0.15s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-14px);
          }
        }
      `}</style>
    </div>
  );
}