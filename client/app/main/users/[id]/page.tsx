"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Briefcase, CalendarDays, CheckCircle2, Clock3, GraduationCap, Target, Trophy, User2 } from "lucide-react";
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
        <div onClick={() => router.push('/main/leaderboard')} className="cursor-pointer mb-4 inline-flex items-center gap-2 text-sm font-bold opacity-70">
          <ArrowLeft size={16} />
          Back to leaderboard
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="flex flex-col gap-4 border-b border-(--border) md:flex-row md:items-end md:justify-between">
        <div className="flex items-center justify-between w-full">
          <div onClick={() => router.push('/main/leaderboard')} className="cursor-pointer mb-4 inline-flex items-center gap-2 text-sm font-bold opacity-70">
            <ArrowLeft size={16} />
            Back to leaderboard
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <User2 size={18} />
            Public profile
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] -mt-3">
        <div className="card2 p-6 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black bg-(--surface) shadow-[4px_4px_0px_black]">
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
              <p className="mt-2 text-sm font-bold opacity-70">
                @{profile.username || "username-not-set"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 border border-black bg-(--surface) px-3 py-2 font-bold shadow-[3px_3px_0px_var(--shadow)]">
                  <CalendarDays size={16} className="text-primary" />
                  Joined {formatDate(profile.joinedOn)}
                </div>

                <div className="inline-flex items-center gap-2 border border-black bg-(--surface) px-3 py-2 font-bold shadow-[3px_3px_0px_var(--shadow)]">
                  <Clock3 size={16} className="text-primary" />
                  Last active {formatDate(profile.lastActive)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-bold opacity-60">Overview</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 opacity-70">
                <GraduationCap size={16} />
                College
              </span>
              <span className="text-right font-extrabold">{profile.college || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 opacity-70">
                <BarChart3 size={16} />
                Semester
              </span>
              <span className="font-extrabold">{semesterLabel(profile.semester)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 opacity-70">
                <Briefcase size={16} />
                Target role
              </span>
              <span className="font-extrabold">{profile.targetRole || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 opacity-70">
                <Target size={16} />
                Current streak
              </span>
              <span className="font-extrabold">{profile.currentStreak} tests</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 opacity-70">
                <Trophy size={16} />
                Longest streak
              </span>
              <span className="font-extrabold">{profile.longestStreak} tests</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">Tests attempted</p>
          <p className="mt-2 text-3xl font-extrabold">{profile.testsAttempted}</p>
          <p className="text-xs opacity-60">first attempts counted</p>
        </div>

        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">Tests created</p>
          <p className="mt-2 text-3xl font-extrabold">{profile.testsCreated}</p>
          <p className="text-xs opacity-60">published from this account</p>
        </div>

        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">Accuracy</p>
          <p className="mt-2 text-3xl font-extrabold">{percent(profile.averageAccuracy)}</p>
          <p className="text-xs opacity-60">average across first attempts</p>
        </div>

        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">Best score</p>
          <p className="mt-2 text-3xl font-extrabold">{Math.round(profile.bestScore || 0)}</p>
          <p className="text-xs opacity-60">highest score achieved</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <p className="text-sm font-bold opacity-60">Performance snapshot</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold uppercase opacity-55">Average score</p>
              <p className="mt-2 text-2xl font-extrabold">{Math.round(profile.averageScore || 0)}</p>
            </div>
            <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold uppercase opacity-55">Questions solved</p>
              <p className="mt-2 text-2xl font-extrabold">{profile.totalQuestionsSolved}</p>
            </div>
            <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold uppercase opacity-55">Correct answers</p>
              <p className="mt-2 text-2xl font-extrabold">{profile.totalCorrect}</p>
            </div>
            <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold uppercase opacity-55">Wrong answers</p>
              <p className="mt-2 text-2xl font-extrabold">{profile.totalWrong}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-bold opacity-60">Attempt breakdown</p>
          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} className="text-primary" />
                  Correct
                </span>
                <span className="font-extrabold">{profile.totalCorrect}</span>
              </div>
              <div className="h-3 border border-black bg-(--surface)">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((profile.totalCorrect / Math.max(profile.totalQuestionsSolved, 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">Wrong</span>
                <span className="font-extrabold">{profile.totalWrong}</span>
              </div>
              <div className="h-3 border border-black bg-(--surface)">
                <div
                  className="h-full bg-[#f08c54]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((profile.totalWrong / Math.max(profile.totalQuestionsSolved, 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">Skipped</span>
                <span className="font-extrabold">{profile.totalSkipped}</span>
              </div>
              <div className="h-3 border border-black bg-(--surface)">
                <div
                  className="h-full bg-[#d8c39a]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((profile.totalSkipped / Math.max(profile.totalQuestionsSolved, 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
