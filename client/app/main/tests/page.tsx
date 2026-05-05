"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3, ClipboardList, ClipboardPen, FileQuestion, ListFilter, Plus, Search, Sparkles } from "lucide-react";
import Loader2 from "@/components/utils/Loader2";
import { useAuth } from "@/context/AuthContext";
import AddSyllabusBanner from "@/components/main/AddSyllabusBanner";

type Test = {
  _id: string;
  title: string;
  type: "manual" | "generated";
  totalQuestions: number;
  duration: number;
  createdAt: string;
};

type TestMode = "all" | "manual" | "generated";
type SortMode = "newest" | "oldest" | "duration" | "questions";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const typeLabel = {
  all: "All",
  manual: "Manual",
  generated: "AI Generated",
};

export default function TestsPage() {
  const router = useRouter();
  const [mode, setMode] = useState<TestMode>("all");
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const { user } = useAuth();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(BACKEND_URL + "/api/test/all", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return;
        setTests(data.tests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const manualTests = tests.filter((test) => test.type === "manual");
  const generatedTests = tests.filter((test) => test.type === "generated");
  const activeTests = mode === "manual" ? manualTests : mode === "generated" ? generatedTests : tests;

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activeTests
      .filter((test) => test.title.toLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sort === "duration") return b.duration - a.duration;
        if (sort === "questions") return b.totalQuestions - a.totalQuestions;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeTests, search, sort]);

  const emptyCopy =
    mode === "all"
      ? "No tests match this view yet. Create a manual paper or generate one with AI to get started."
      : mode === "manual"
        ? "No manual tests match this view. Create a structured paper when you need full control."
        : "No AI generated tests match this view. Generate a new set for fast topic practice.";

  return (
    <div className="space-y-7 relative">
      {!user?.onboardingCompleted &&
        <div onClick={() => router.push('/main/profile/education')} className="md:absolute mb-5 md:mb-0 right-0 z-50 bg-yellow-50 text-black flex items-center gap-2 text-sm px-3 py-2 w-fit rounded-md cursor-pointer transition-all">
          <div className="h-2 w-2 bg-yellow-300 animate-pulse rounded-full"></div>
          Click here your syllabus in profile for personalized tests <ArrowRight className="h-4" />
        </div>
      }
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <ClipboardList size={18} />
            Test Library
          </div>
        </div>

      </section>

      <section className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center -mt-3">
        <div className="flex justify-between md:gap-3">
          {(["all", "manual", "generated"] as TestMode[]).map((testMode) => (
            <button
              key={testMode}
              onClick={() => setMode(testMode)}
              className={`h-10 rounded-none px-4 shadow-none hover:transform-none hover:shadow-none ${mode === testMode
                ? "bg-primary text-white"
                : "button-secondary border-transparent bg-transparent text-(--text)"
                }`}
            >
              {testMode === "generated" ? (
                <>
                  <span className="sm:hidden">AI tests</span>
                  <span className="hidden sm:inline">AI Generated</span>
                </>
              ) : (
                typeLabel[testMode]
              )}
              <span className="ml-2 text-xs opacity-80">
                {testMode === "all" ? tests.length : testMode === "manual" ? manualTests.length : generatedTests.length}
              </span>
            </button>
          ))}
        </div>

        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by test title..."
            className="h-11 w-full pl-10!"
          />
        </label>

        <label className="relative lg:w-52">
          <ListFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="h-11 w-full pl-10!"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="duration">Longest duration</option>
            <option value="questions">Most questions</option>
          </select>
        </label>
      </section>

      <section className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <div className="card p-5 hidden md:flex flex-col">
          <p className="text-sm font-bold opacity-60">Showing</p>
          <p className="mt-2 text-3xl font-extrabold">{filteredTests.length}</p>
          <p className="text-xs opacity-60">{typeLabel[mode]} tests</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">Manual papers</p>
          <p className="mt-2 text-3xl font-extrabold">{manualTests.length}</p>
          <p className="text-xs opacity-60">created with fixed structure</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold opacity-60">AI sets</p>
          <p className="mt-2 text-3xl font-extrabold">{generatedTests.length}</p>
          <p className="text-xs opacity-60">generated practice tests</p>
        </div>
      </section>

      <section>
        <div className="mb-3 grid grid-cols-[1fr_9rem_8rem_10rem_7rem] gap-4 px-5 text-xs font-extrabold uppercase opacity-50 max-lg:hidden">
          <span>Test</span>
          <span>Questions</span>
          <span>Duration</span>
          <span>Created</span>
          <span className="text-right">Action</span>
        </div>

        {loading ? (
          <Loader2 />
        ) : filteredTests.length === 0 ? (
          <div className="card grid min-h-64 place-items-center p-7 text-center">
            <div>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-black bg-primary text-white shadow-[4px_4px_0px_black]">
                <FileQuestion size={26} />
              </div>
              <p className="text-2xl font-extrabold">No tests found</p>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-65">
                {search ? "Try another search term or clear the search field." : emptyCopy}
              </p>
              <button
                onClick={() =>
                  router.push(mode === "all" ? "/main/create" : `${mode === "generated" ? "/main/create/generate" : "/main/create/manual"}`)
                }
                className="mt-6 gap-2"
              >
                <Plus size={18} />
                {mode === "all" ? "Create a test" : `${mode === "generated" ? "Generate AI test" : "Create manual test"}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTests.map((test) => {
              const isGenerated = test.type === "generated";

              return (
                <article
                  key={test._id}
                  className="card grid gap-4 p-5 lg:grid-cols-[1fr_9rem_8rem_10rem_7rem] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 border border-black bg-(--surface) px-2 py-0.5 text-xs font-extrabold uppercase">
                        {isGenerated ? <Sparkles size={13} /> : <ClipboardPen size={13} />}
                        {isGenerated ? "AI" : "Manual"}
                      </span>
                    </div>
                    <p className="truncate text-xl font-bold">{test.title || "Untitled test"}</p  >
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileQuestion size={17} className="text-primary" />
                    <span className="font-bold">{test.totalQuestions}</span>
                    <span className="opacity-60 lg:hidden">questions</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock3 size={17} className="text-primary" />
                    <span className="font-bold">{test.duration} min</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={17} className="text-primary" />
                    <span className="font-bold">{formatDate(test.createdAt)}</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className="button-secondary w-full gap-2 lg:w-fit"
                      onClick={() => router.push(`/main/test/preview/${test._id}`)}
                    >
                      Preview
                      <ArrowRight size={18} />
                    </button>
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
