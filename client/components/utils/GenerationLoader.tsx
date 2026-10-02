"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lightbulb, Sparkles } from "lucide-react";

export type GenerationStep = {
  label: string;
  detail?: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: GenerationStep[];
  /** Short chips describing what is being built, e.g. "20 questions". */
  summary?: string[];
  tips?: string[];
};

const DEFAULT_TIPS = [
  "You can mark questions for review and jump between them from the palette during the attempt.",
  "Timed attempts are saved to your history with a full answer review.",
  "Retake any test from its preview page to see whether your score moves.",
  "Keep this tab open. You will be taken to the preview the moment the test is ready.",
];

/**
 * Relative time budget for each step before the last one. The final step
 * holds until the parent unmounts this loader, so the wait never looks stuck
 * on a step that claims to be finished.
 */
const STEP_WEIGHTS = [2.5, 4, 9, 7, 6, 5];

const formatElapsed = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function GenerationLoader({
  eyebrow = "AI generation",
  title,
  description,
  steps,
  summary = [],
  tips = DEFAULT_TIPS,
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - start), 250);
    return () => window.clearInterval(id);
  }, []);

  // Cumulative millisecond boundaries at which each step hands over to the next.
  const boundaries = useMemo(() => {
    const count = Math.max(0, steps.length - 1);
    const weights = Array.from({ length: count }, (_, i) => STEP_WEIGHTS[i % STEP_WEIGHTS.length]);
    let total = 0;
    return weights.map((weight) => (total += weight * 1000));
  }, [steps.length]);

  const activeIndex = useMemo(() => {
    const next = boundaries.findIndex((boundary) => elapsed < boundary);
    return next === -1 ? steps.length - 1 : next;
  }, [boundaries, elapsed, steps.length]);

  // Eases towards 94% and never claims completion; the redirect does that.
  const progress = Math.min(94, Math.round(100 * (1 - Math.exp(-elapsed / 22000))));
  const tip = tips.length ? tips[Math.floor(elapsed / 7000) % tips.length] : null;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center" aria-busy="true" aria-live="polite">
      <div className="card2 w-full p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Sparkles size={18} className="animate-pulse" />
            {eyebrow}
          </div>
          <span className="rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 font-mono text-xs font-bold tabular-nums opacity-80">
            {formatElapsed(elapsed)}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-6 opacity-65">{description}</p>}

        {summary.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.filter(Boolean).map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex max-w-full items-center truncate rounded-full border border-(--border) bg-(--bg-secondary) px-3.5 py-1.5 text-xs font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase opacity-55">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <ol className="mt-6 space-y-2">
          {steps.map((step, index) => {
            const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";

            return (
              <li
                key={step.label}
                className={`flex items-start gap-4 rounded-2xl border px-4 py-3 transition-colors duration-500 ${
                  state === "active"
                    ? "border-primary-soft bg-primary-soft"
                    : state === "done"
                      ? "border-transparent"
                      : "border-transparent opacity-45"
                }`}
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center">
                  {state === "done" && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">
                      <Check size={15} strokeWidth={3} />
                    </span>
                  )}
                  {state === "active" && (
                    <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-(--border) border-t-(--primary)" />
                  )}
                  {state === "pending" && (
                    <span className="h-7 w-7 rounded-full border-2 border-dashed border-(--border)" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`font-extrabold ${state === "done" ? "opacity-70" : ""}`}>{step.label}</p>
                    <span
                      className={`shrink-0 text-[11px] font-extrabold uppercase tracking-wide ${
                        state === "active" ? "animate-pulse text-primary" : "opacity-55"
                      }`}
                    >
                      {state === "done" ? "Done" : state === "active" ? "In progress" : "Queued"}
                    </span>
                  </div>
                  {step.detail && state !== "pending" && (
                    <p className="mt-0.5 truncate text-xs opacity-60">{step.detail}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {tip && (
          <div className="mt-6 flex items-start gap-3 border-t border-(--border) pt-5 text-sm">
            <Lightbulb size={17} className="mt-0.5 shrink-0 text-primary" />
            <p className="leading-6 opacity-70">{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
