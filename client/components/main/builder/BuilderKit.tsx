"use client";

import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ---------------------------------- Step --------------------------------- */

export function StepSection({
  step,
  title,
  description,
  action,
  error,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  action?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="step-badge mt-0.5">{step}</span>

          <div>
            <h2 className="text-lg font-extrabold leading-tight">{title}</h2>
            {description && <p className="mt-1 text-sm opacity-65">{description}</p>}
          </div>
        </div>

        {action && <div className="flex shrink-0 flex-wrap gap-2 sm:pt-1">{action}</div>}
      </div>

      {error && <p className="mb-3 ml-1 text-xs font-semibold text-red-500">{error}</p>}

      <div>{children}</div>
    </section>
  );
}

/* ------------------------------- Indicator -------------------------------- */

export function SelectionIndicator({
  selected,
  round = false,
}: {
  selected: boolean;
  round?: boolean;
}) {
  return (
    <span
      className={`select-indicator ${round ? "is-round" : ""}`}
      data-selected={selected}
      aria-hidden="true"
    >
      {round ? (
        <span className={`h-2 w-2 rounded-full ${selected ? "bg-white" : "bg-transparent"}`} />
      ) : (
        <Check size={14} strokeWidth={3.5} />
      )}
    </span>
  );
}

/* ------------------------------- OptionCard ------------------------------- */

export function OptionCard({
  selected,
  onSelect,
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  multi = false,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  multi?: boolean;
}) {
  return (
    <div
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={0}
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="select-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary">{eyebrow}</p>
          )}

          <div className="flex items-center gap-3">
            {Icon && <Icon size={22} className="shrink-0 text-primary" />}
            <h3 className="text-lg font-extrabold leading-tight">{title}</h3>
          </div>

          {description && <p className="mt-2 text-sm opacity-70">{description}</p>}
        </div>

        <SelectionIndicator selected={selected} round={!multi} />
      </div>

      {meta && <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-70">{meta}</div>}

      {selected && (
        <p className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-primary">
          <Check size={13} strokeWidth={3.5} />
          Selected
        </p>
      )}
    </div>
  );
}

/* ------------------------------- ChoiceChip ------------------------------- */

export function ChoiceChip({
  selected,
  onSelect,
  label,
  icon: Icon,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="select-chip"
    >
      {selected ? <Check size={13} strokeWidth={3.5} /> : Icon ? <Icon size={13} /> : null}
      {label}
    </span>
  );
}

/* ---------------------------- SegmentedControl ---------------------------- */

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div>
      {label && <p className="mb-2 text-sm font-bold">{label}</p>}

      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <span
            key={option.value}
            role="radio"
            aria-checked={value === option.value}
            tabIndex={0}
            data-selected={value === option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onChange(option.value);
              }
            }}
            className="segmented-option"
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- RangeField ------------------------------ */

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{label}</p>
        <span className="text-sm font-extrabold text-primary">
          {value}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--range-progress": `${progress}%` } as CSSProperties}
        className="w-full"
        aria-label={label}
      />

      <div className="mt-2 flex items-center justify-between text-xs opacity-50">
        <span>
          {min}
          {suffix ? ` ${suffix}` : ""}
        </span>
        <span>
          {max}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>

      {hint && <p className="mt-2 text-xs text-red-500">{hint}</p>}
    </div>
  );
}

/* -------------------------------- BuilderBar ------------------------------ */

export function BuilderBar({
  items,
  note,
  children,
}: {
  items: { label: string; value: string }[];
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="builder-bar">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="hidden flex-wrap gap-x-6 gap-y-3 sm:flex">
            {items.map((item) => (
              <div key={item.label}>
                <p className="text-[11px] font-bold uppercase tracking-wide opacity-55">{item.label}</p>
                <p className="text-sm font-extrabold">{item.value}</p>
              </div>
            ))}
          </div>

          {note && <p className="text-xs opacity-65 sm:mt-2">{note}</p>}
        </div>

        <div className="flex gap-3 lg:shrink-0">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------- PageHeading ------------------------------ */

export function PageHeading({
  eyebrow,
  icon: Icon,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 border-b border-(--border) pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-primary">
          <Icon size={18} />
          {eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{title}</h1>

        {description && <p className="mt-2 max-w-2xl text-sm opacity-65">{description}</p>}
      </div>

      {aside && <div className="shrink-0">{aside}</div>}
    </section>
  );
}
