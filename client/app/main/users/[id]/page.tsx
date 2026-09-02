"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  CalendarDays,
  Clock3,
  Flame,
  GraduationCap,
  ListChecks,
  Target,
  Trophy,
  User2,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type PublicProfile = {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
  college?: string;
  semester?: number | null;
  joinedOn: string;
  targetRole?: string;
  testsAttempted: number;
  testsCreated: number;
  averageAccuracy: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  currentStreak: number;
  longestStreak: number;
  lastActive?: string | null;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const percent = (value?: number) => `${Math.round(value || 0)}%`;

const semesterLabel = (value?: number | null) => {
  if (!value) return "Not set";
  if (value === 1) return "1st semester";
  if (value === 2) return "2nd semester";
  if (value === 3) return "3rd semester";
  return `${value}th semester`;
};

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BACKEND_URL}/api/user/public/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Could not load this profile");
          return;
        }

        setProfile(data.profile || null);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Could not load this profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return <Loader2 />;
  }

  if (!profile || error) {
    return (
      <div className="card mx-auto max-w-3xl p-8 text-center">
        <p className="text-2xl font-extrabold">Profile unavailable</p>
        <p className="mt-2 text-sm opacity-65">{error || "We could not find that user."}</p>
        <button
          onClick={() => router.push("/main/leaderboard")}
          className="button-secondary mt-6 gap-2"
        >
          <ArrowLeft size={16} />
          Back to leaderboard
        </button>
      </div>
    );
  }

  const breakdown = [
    { key: "correct", label: "Correct", value: profile.totalCorrect || 0, color: "var(--chart-correct)" },
    { key: "wrong", label: "Wrong", value: profile.totalWrong || 0, color: "var(--chart-wrong)" },
    { key: "skipped", label: "Skipped", value: profile.totalSkipped || 0, color: "var(--chart-skipped)" },
  ];
  const answered = breakdown.reduce((sum, part) => sum + part.value, 0);
  const segments = breakdown
    .filter((part) => part.value > 0)
    .map((part) => ({ ...part, pct: (part.value / answered) * 100 }));

  const overview = [
    { icon: GraduationCap, label: "College", value: profile.college || "Not set" },
    { icon: BarChart3, label: "Semester", value: semesterLabel(profile.semester) },
    { icon: Briefcase, label: "Target role", value: profile.targetRole || "Not set" },
    { icon: Flame, label: "Current streak", value: `${profile.currentStreak} tests` },
    { icon: Trophy, label: "Longest streak", value: `${profile.longestStreak} tests` },
  ];

  const stats = [
    { label: "Tests attempted", value: profile.testsAttempted, hint: "first attempts counted" },
    { label: "Tests created", value: profile.testsCreated, hint: "published from this account" },
    { label: "Questions solved", value: profile.totalQuestionsSolved, hint: "across every attempt" },
    { label: "Best score", value: Math.round(profile.bestScore || 0), hint: "highest score achieved" },
  ];

  const accuracy = Math.min(100, Math.max(0, Math.round(profile.averageAccuracy || 0)));

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="flex items-center justify-between gap-4 border-b border-(--border) pb-2">
        <div
          onClick={() => router.push("/main/leaderboard")}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold opacity-70"
        >
          <ArrowLeft size={16} />
          Back to leaderboard
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
          <User2 size={18} />
          Public profile
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] -mt-3">
        <div className="card2 p-6 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--border) bg-(--surface) shadow-(--shadow-md)">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name || "User"}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User2 className="h-12 w-12 opacity-60" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-3xl font-extrabold">{profile.name || "Unnamed user"}</p>
              <p className="mt-1 text-sm font-bold opacity-60">
                @{profile.username || "username-not-set"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1.5 text-xs font-bold">
                  <CalendarDays size={15} className="text-primary" />
                  Joined {formatDate(profile.joinedOn)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1.5 text-xs font-bold">
                  <Clock3 size={15} className="text-primary" />
                  Last active {formatDate(profile.lastActive)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-(--border) pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
                  <Target size={14} className="text-primary" />
                  Average accuracy
                </p>
                <p className="mt-1 text-4xl font-extrabold">{percent(profile.averageAccuracy)}</p>
              </div>
              <p className="text-xs opacity-60">
                Average score {Math.round(profile.averageScore || 0)}
              </p>
            </div>

            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)]"
              role="img"
              aria-label={`Average accuracy ${accuracy} percent`}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-xs font-bold uppercase opacity-55">Overview</p>
          <div className="mt-4 space-y-3 text-sm">
            {overview.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 opacity-70">
                  <row.icon size={16} />
                  {row.label}
                </span>
                <span className="min-w-0 truncate text-right font-extrabold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs font-bold uppercase opacity-55">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{stat.value}</p>
            <p className="text-xs opacity-60">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
          <ListChecks size={17} />
          Answer breakdown
        </div>
        <p className="mt-2 text-sm opacity-65">
          How {answered.toLocaleString("en-IN")} answered question
          {answered === 1 ? "" : "s"} split across every attempt.
        </p>

        {answered === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-(--border) px-4 py-6 text-center text-sm opacity-60">
            No questions attempted yet.
          </p>
        ) : (
          <>
            <div className="mt-6 flex h-4 w-full gap-[2px]">
              {segments.map((part, i) => (
                <div
                  key={part.key}
                  title={`${part.label}: ${part.value} (${Math.round(part.pct)}%)`}
                  style={{ flexBasis: `${part.pct}%`, background: part.color }}
                  className={`flex min-w-0 items-center justify-center overflow-hidden ${i === 0 ? "rounded-l-[4px]" : ""} ${i === segments.length - 1 ? "rounded-r-[4px]" : ""}`}
                >
                  {part.pct >= 14 && (
                    <span className="text-[10px] font-extrabold text-white">
                      {Math.round(part.pct)}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {breakdown.map((part) => (
                <div
                  key={part.key}
                  className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-secondary) px-4 py-3"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: part.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-xs font-bold uppercase opacity-55">{part.label}</dt>
                    <dd className="text-lg font-extrabold">
                      {part.value}
                      <span className="ml-2 text-xs font-bold opacity-55">
                        {Math.round((part.value / answered) * 100)}%
                      </span>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
    </div>
  );
}
