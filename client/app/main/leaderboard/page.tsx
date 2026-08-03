"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ChevronDown, Medal, Search, Trophy, User2, Users } from "lucide-react";
import Image from 'next/image'
import { useRouter } from "next/navigation";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";

type LeaderboardUser = {
  _id: string;
  name?: string;
  username?: string;
  avgAccuracy?: number;
  avgScore?: number;
  testsTaken?: number;
  avatar?: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const percent = (value?: number) => `${Math.round(value || 0)}%`;

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(BACKEND_URL + "/api/leaderboard", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => (user.name || "Student").toLowerCase().includes(query));
  }, [search, users]);

  const topUser = users[0];
  const averageAccuracy =
    users.length > 0
      ? Math.round(users.reduce((total, user) => total + (user.avgAccuracy || 0), 0) / users.length)
      : 0;
  const totalTests = users.reduce((total, user) => total + (user.testsTaken || 0), 0);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Trophy size={18} />
            Leaderboard
          </div>
        </div>

        <label className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student..."
            className="h-11 w-full pl-10!"
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card2 p-5">
          <Medal size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Current leader</p>
          <p className="mt-2 truncate text-2xl font-extrabold">
            {topUser?.name || "No attempts yet"}
          </p>
          <p className="text-xs opacity-60">
            {topUser ? `${percent(topUser.avgAccuracy)} accuracy` : "Waiting for first result"}
          </p>
        </div>

        <div className="card p-5">
          <CheckCircle2 size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Average accuracy</p>
          <p className="mt-2 text-3xl font-extrabold">{users.length ? `${averageAccuracy}%` : "--"}</p>
          <p className="text-xs opacity-60">across ranked students</p>
        </div>

        <div className="card p-5">
          <Users size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Ranked activity</p>
          <p className="mt-2 text-3xl font-extrabold">{totalTests}</p>
          <p className="text-xs opacity-60">first attempts counted</p>
        </div>
      </section>

      <section>
        <div className="mb-3 grid grid-cols-[6rem_1fr_8rem_8rem_8rem] gap-4 px-5 text-xs font-extrabold uppercase opacity-50 max-lg:hidden">
          <span>Rank</span>
          <span>Student</span>
          <span>Accuracy</span>
          <span>Tests</span>
          <span>Avg score</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="card grid min-h-56 place-items-center p-7 text-center">
            <div>
              <Trophy className="mx-auto mb-4 text-primary" size={34} />
              <p className="text-2xl font-extrabold">No ranked students found</p>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-65">
                {search ? "Try a different search term." : "The leaderboard will update after first attempts are submitted."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const rank = users.findIndex((rankedUser) => rankedUser._id === user._id) + 1;
              const isTopThree = rank <= 3;
              const isExpanded = !!expandedUsers[user._id];

              return (
                <article
                  key={user._id}
                  className="card p-5"
                >
                  <div className="flex items-start justify-between gap-3 lg:hidden">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <p className={`grid h-8 w-8 place-items-center text-sm font-extrabold ${isTopThree ? "text-primary" : ""}`}>
                          #{rank}
                        </p>
                        <div>
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full object-cover border"
                            />
                          ) : (
                            <User2 className="h-10 w-10 rounded-full border p-2" />
                          )}
                        </div>
                      </div>

                      <p
                        onClick={() => router.push(`/main/users/${user._id}`)}
                        className="truncate cursor-pointer text-lg font-extrabold transition-all duration-200 hover:text-primary"
                      >
                        {user.name || "Student"} <span className="ml-2 text-sm font-light">@{user?.username || "user"}</span>
                      </p>

                      <p className="mt-2 text-xs opacity-60">
                        Ranked by accuracy and average score from first attempts
                      </p>
                    </div>

                    <div
                      onClick={() => toggleUser(user._id)}
                      className="mt-1 rounded-full border border-(--border) p-2 transition hover:bg-black/5"
                      aria-label={isExpanded ? "Collapse leaderboard user details" : "Expand leaderboard user details"}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 grid gap-3 border-t border-(--border) pt-4 lg:hidden">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={17} className="text-primary" />
                        <span className="font-extrabold">{percent(user.avgAccuracy)}</span>
                        <span className="opacity-60">accuracy</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 size={17} className="text-primary" />
                        <span className="font-extrabold">{user.testsTaken || 0}</span>
                        <span className="opacity-60">tests taken</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Trophy size={17} className="text-primary" />
                        <span className="font-extrabold">{Math.round(user.avgScore || 0)}</span>
                        <span className="opacity-60">avg score</span>
                      </div>
                    </div>
                  )}

                  <div className="hidden gap-4 lg:grid lg:grid-cols-[6rem_1fr_8rem_8rem_8rem] lg:items-center">
                    <div className="flex items-center gap-3">
                      <p className={`grid h-8 w-8 place-items-center text-sm font-extrabold ${isTopThree ? "text-primary" : ""}`}>
                        #{rank}
                      </p>
                      <div>
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover border"
                          />
                        ) : (
                          <User2 className="h-10 w-10 rounded-full border p-2" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p
                        onClick={() => router.push(`/main/users/${user._id}`)}
                        className="truncate cursor-pointer text-lg font-extrabold transition-all duration-200 hover:text-primary"
                      >
                        {user.name || "Student"} <span className="ml-2 text-sm font-light">@{user?.username || "user"}</span>
                      </p>

                      <p className="mt-2 text-xs opacity-60">
                        Ranked by accuracy and average score from first attempts
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={17} className="text-primary" />
                      <span className="font-extrabold">{percent(user.avgAccuracy)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 size={17} className="text-primary" />
                      <span className="font-extrabold">{user.testsTaken || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Trophy size={17} className="text-primary" />
                      <span className="font-extrabold">{Math.round(user.avgScore || 0)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
