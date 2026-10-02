"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Brain,
  CalendarDays,
  ClipboardPen,
  Clock3,
  Eye,
  FileQuestion,
  Gauge,
  Layers3,
  MonitorCheck,
  RotateCcw,
  Sparkles,
  Timer,
  TimerOff,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PreviewSkeleton from "@/components/skeletons/PreviewSkeleton";

type TestPreviewData = {
  _id: string;
  title: string;
  type?: "manual" | "generated";
  category?: "academic" | "aptitude";
  testFormat?: "mcq" | "subjective";
  aptitude?: {
    sections?: string[];
    topics?: string[];
    company?: string;
    companyLabel?: string;
  };
  difficulty?: string;
  totalQuestions?: number;
  totalMarks?: number;
  duration?: number;
  subjects?: string[];
  createdAt?: string;
  questions?: { marks?: number }[];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const MAX_VISIBLE_CHIPS = 14;

const sectionLabels: Record<string, string> = {
  quantitative: "Quantitative Aptitude",
  logical: "Logical Reasoning",
  verbal: "Verbal Ability",
  "data-interpretation": "Data Interpretation",
};

const sectionLabel = (key: string) =>
  sectionLabels[key] ||
  key.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value?: string) => {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function TestPreview() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [test, setTest] = useState<TestPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(BACKEND_URL + `/api/test/${id}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) return;

        setTest(data.test);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTest();
  }, [id]);

  const startTest = async () => {
    if (starting) return;

    try {
      setStarting(true);

      const res = await fetch(BACKEND_URL + "/api/attempt/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: id }),
      });

      const data = await res.json();

      if (!res.ok) return;

      router.push(`/main/test/attempt/${data.attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <PreviewSkeleton />;

  if (!test) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <div className="card max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
            <FileQuestion size={26} />
          </div>
          <h2 className="text-3xl font-extrabold">Test not found</h2>
          <p className="mt-3 text-sm opacity-65">
            This test may have been removed or is unavailable.
          </p>
          <button
            onClick={() => router.push("/main/tests")}
            className="button-secondary mx-auto mt-7 gap-2"
          >
            <ArrowLeft size={18} />
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  const questionCount = test.totalQuestions || test.questions?.length || 0;
  const subjects = test.subjects || [];
  const sections = test.aptitude?.sections || [];
  const topics = test.aptitude?.topics || [];
  const duration = test.duration || 0;

  const isGenerated = test.type === "generated";
  const isAptitude = test.category === "aptitude";
  const isSubjective = test.testFormat === "subjective";

  const backHref = isAptitude ? "/main/aptitude" : "/main/tests";
  const backLabel = isAptitude ? "Aptitude Gym" : "Test library";

  const TestTypeIcon: LucideIcon = isAptitude ? Brain : isGenerated ? Sparkles : ClipboardPen;
  const typeLabel = isAptitude ? "Aptitude" : isGenerated ? "AI Generated" : "Manual";
  const formatLabel = isSubjective ? "Subjective" : "MCQ";
  const difficulty = test.difficulty || "Mixed";

  const totalMarks =
    test.totalMarks ||
    test.questions?.reduce((sum, question) => sum + (question.marks || 0), 0) ||
    0;

  const paceSeconds =
    questionCount && duration ? Math.max(1, Math.round((duration * 60) / questionCount)) : null;

  const paceLabel = paceSeconds
    ? paceSeconds >= 120
      ? `${Math.round(paceSeconds / 60)} min`
      : `${paceSeconds} sec`
    : "--";

  // Coverage chips: aptitude sets show sections then topics, everything else shows subjects.
  const coverage: { label: string; strong?: boolean }[] = isAptitude
    ? [
        ...sections.map((section) => ({ label: sectionLabel(section), strong: true })),
        ...topics.map((topic) => ({ label: topic })),
      ]
    : subjects.map((subject) => ({ label: subject }));

  const visibleCoverage = coverage.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCoverage = coverage.length - visibleCoverage.length;

  const facts: { icon: LucideIcon; text: string }[] = [
    {
      icon: Trophy,
      text: isSubjective
        ? totalMarks
          ? `${totalMarks} marks in total, evaluated by AI with feedback`
          : "Marked per question and evaluated by AI with feedback"
        : "1 mark per correct answer, no negative marking",
    },
    { icon: TimerOff, text: "Timer starts on launch and auto-submits at 0:00" },
    { icon: Bookmark, text: "Mark questions for review and jump via the palette" },
    { icon: MonitorCheck, text: "Keep this tab open until you submit" },
  ];

  const journey = [
    { label: isAptitude ? "Start the timed round" : "Start the test", note: `${duration} minute timer begins` },
    { label: "Answer and submit", note: "Mark for review, jump via palette" },
    { label: "Score and review", note: "Every answer explained" },
  ];

  return (
    <div className="flex min-h-screen flex-col px-4 py-5 md:px-8">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push(backHref)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(backHref);
            }
          }}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold opacity-70 transition-opacity hover:opacity-100"
        >
          <ArrowLeft size={16} />
          Back to {backLabel}
        </div>

        <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
          <Eye size={18} />
          Test preview
        </div>
      </header>

      {/* Content-sized card, vertically centered in whatever space is left */}
      <main className="flex flex-1 items-center justify-center py-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[24px] border border-(--border) bg-(--surface) shadow-(--shadow-md) md:grid-cols-[minmax(0,1fr)_19rem]">
          {/* Left: the paper */}
          <section className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-extrabold uppercase text-white">
                <TestTypeIcon size={13} />
                {typeLabel}
              </span>
              <Chip>{formatLabel}</Chip>
              <Chip>{difficulty}</Chip>
              {test.aptitude?.companyLabel && <Chip>{test.aptitude.companyLabel}</Chip>}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              {test.title || "Untitled Test"}
            </h1>

            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-65">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                Created {formatDate(test.createdAt)}
              </span>
              {paceSeconds && (
                <span className="inline-flex items-center gap-1.5">
                  <Timer size={14} />
                  About {paceLabel} per question
                </span>
              )}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile icon={FileQuestion} label="Questions" value={String(questionCount)} />
              <StatTile icon={Clock3} label="Duration" value={`${duration} min`} />
              <StatTile
                icon={Trophy}
                label={isSubjective ? "Total marks" : "Marking"}
                value={isSubjective ? (totalMarks ? String(totalMarks) : "--") : "+1 each"}
              />
              <StatTile icon={Gauge} label="Difficulty" value={difficulty} />
            </div>

            <div className="mt-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
                <Layers3 size={14} />
                {isAptitude ? "Sections and topics" : "Subjects covered"}
                <span className="ml-auto normal-case opacity-80">
                  {coverage.length} {isAptitude ? "areas" : `subject${coverage.length === 1 ? "" : "s"}`}
                </span>
              </p>

              {coverage.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleCoverage.map((item) => (
                    <span
                      key={item.label}
                      className={
                        item.strong
                          ? "border-primary-soft bg-primary-soft inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold text-primary"
                          : "inline-flex items-center rounded-full border border-(--border) bg-(--bg-secondary) px-3.5 py-1.5 text-sm font-medium"
                      }
                    >
                      {item.strong && <Brain size={13} />}
                      {item.label}
                    </span>
                  ))}
                  {hiddenCoverage > 0 && (
                    <span className="inline-flex items-center rounded-full border border-dashed border-(--border) px-3.5 py-1.5 text-sm font-bold opacity-60">
                      +{hiddenCoverage} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm opacity-60">
                  No subject labels were attached. Questions are mixed practice.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-3 border-t border-(--border) pt-5 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.text} className="flex items-start gap-2.5">
                  <fact.icon size={15} className="mt-0.5 shrink-0 text-primary" />
                  <p className="text-sm leading-5 opacity-75">{fact.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right: launch panel */}
          <aside className="flex flex-col border-t border-(--border) bg-(--bg-secondary) p-6 md:border-l md:border-t-0 md:p-7">
            <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
              <Timer size={14} />
              Ready when you are
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-extrabold leading-none">{duration || "--"}</span>
              <span className="pb-1 text-lg font-bold opacity-60">min</span>
            </div>

            <p className="mt-2 text-sm opacity-65">
              {questionCount} {formatLabel} question{questionCount === 1 ? "" : "s"}
              {isAptitude && test.aptitude?.companyLabel ? ` · ${test.aptitude.companyLabel} pattern` : ""}
            </p>

            <ol className="mt-6 space-y-4">
              {journey.map((step, index) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className="step-badge">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-tight">{step.label}</p>
                    <p className="mt-0.5 text-xs opacity-60">{step.note}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-(--border) pt-6">
              <button
                onClick={startTest}
                disabled={starting}
                className={`w-full justify-between ${starting ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {starting ? "Preparing attempt..." : isAptitude ? "Start timed round" : "Start test"}
                <ArrowRight size={18} />
              </button>

              {isAptitude && (
                <button
                  onClick={() => router.push(`/main/aptitude/practice/${test._id}`)}
                  className="button-secondary mt-3 w-full justify-between"
                >
                  Practice untimed
                  <RotateCcw size={18} />
                </button>
              )}

              <p className="mt-3 text-center text-xs opacity-55">
                Timer starts immediately. Auto-submits at 0:00.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--border) bg-(--bg-secondary) px-3.5 py-1.5 text-xs font-bold">
      {children}
    </span>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase opacity-55">
        <Icon size={14} className="text-primary" />
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-extrabold leading-tight">{value}</p>
    </div>
  );
}

