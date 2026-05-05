"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  compact?: boolean;
  className?: string;
};

export default function CompleteOnboardingBanner({ compact = false, className = "" }: Props) {
  const router = useRouter();

  return (
    <div
      className={`border border-(--border) bg-(--bg-secondary) p-4 text-(--text) shadow-[4px_4px_0px_var(--shadow)] ${className}`.trim()}
    >
      <div className={`flex ${compact ? "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" : "flex-col gap-4 md:flex-row md:items-start md:justify-between"}`}>
        <div className="flex items-center gap-3">
          <div className="mt-0.5 shrink-0 text-primary">
            <CircleAlert size={28}/>
          </div>
          <div>
            <p className="font-extrabold text-primary">Complete onboarding</p>
            <p className="mt-1 text-sm opacity-70">
              Finish your profile setup to add your academic details and syllabus for a more personalized experience.
            </p>
          </div>
        </div>

        <button type="button" onClick={() => router.push("/onboarding")} className="gap-2 self-start">
          Complete onboarding
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
