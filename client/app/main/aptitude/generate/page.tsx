"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Brain,
    Briefcase,
    Calculator,
    Check,
    Puzzle,
    Shapes,
    SpellCheck,
    Sparkles,
    Target,
    TicketCheck,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import {
    BuilderBar,
    ChoiceChip,
    OptionCard,
    PageHeading,
    RangeField,
    SegmentedControl,
    SelectionIndicator,
    StepSection,
} from "@/components/main/builder/BuilderKit";
import Loader2 from "@/components/utils/Loader2";
import { AiTokenStatus as AiTokenStatusType, useAiTokens } from "@/context/AiTokenContext";
import { useAuth } from "@/context/AuthContext";
import {
    AptitudeCatalog,
    AptitudeDifficulty,
    DEFAULT_APTITUDE_CATALOG,
    fetchAptitudeCatalog,
} from "@/lib/aptitude";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const sectionIcons: Record<string, LucideIcon> = {
    quantitative: Calculator,
    logical: Puzzle,
    verbal: SpellCheck,
    "data-interpretation": Shapes,
};

export default function GenerateAptitudePage() {
    return (
        <Suspense fallback={<Loader2 />}>
            <GenerateAptitudeSet />
        </Suspense>
    );
}

function CompactOption({
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
        <div
            role="radio"
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
            className="select-card flex items-center gap-3 p-4!"
        >
            <SelectionIndicator selected={selected} round />
            {Icon && <Icon size={16} className="shrink-0 text-primary" />}
            <span className="text-sm font-bold leading-tight">{label}</span>
        </div>
    );
}

function GenerateAptitudeSet() {
    const searchParams = useSearchParams();
    const { getMe } = useAuth();
    const { tokenStatus, refreshTokenStatus, setTokenStatus } = useAiTokens();

    const [catalog, setCatalog] = useState<AptitudeCatalog>(DEFAULT_APTITUDE_CATALOG);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [sections, setSections] = useState<string[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<AptitudeDifficulty>("Medium");
    const [company, setCompany] = useState("general");
    const [questions, setQuestions] = useState(20);
    const [duration, setDuration] = useState(20);
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const limits = catalog.limits;
    const hasTokens = tokenStatus?.hasTokens ?? false;
    const tokenStatusUnavailable = !tokenStatus;

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAptitudeCatalog();
                setCatalog(data);

                const requestedSection = searchParams.get("section");
                const requestedTopics = (searchParams.get("topics") || "")
                    .split("|")
                    .map((topic) => topic.trim())
                    .filter(Boolean);

                const sectionOf = (topic: string) =>
                    data.sections.find((section) => section.topics.includes(topic))?.key;

                const derivedSections = new Set<string>();

                if (requestedSection && data.sections.some((section) => section.key === requestedSection)) {
                    derivedSections.add(requestedSection);
                }

                const validTopics = requestedTopics.filter((topic) => Boolean(sectionOf(topic)));
                validTopics.forEach((topic) => {
                    const key = sectionOf(topic);
                    if (key) derivedSections.add(key);
                });

                if (derivedSections.size) {
                    setSections([...derivedSections]);
                } else {
                    setSections(data.sections.slice(0, 2).map((section) => section.key));
                }

                if (validTopics.length) {
                    setTopics(validTopics);
                }

                setQuestions((current) =>
                    Math.min(Math.max(current, data.limits.minQuestions), data.limits.maxQuestions),
                );
            } catch (err) {
                console.error("Failed to load aptitude catalog", err);
                toast.error("Could not load the aptitude catalog");
            } finally {
                setCatalogLoading(false);
            }
        };

        load();
    }, [searchParams]);

    const selectedSections = useMemo(
        () => catalog.sections.filter((section) => sections.includes(section.key)),
        [catalog.sections, sections],
    );

    const availableTopics = useMemo(
        () => selectedSections.flatMap((section) => section.topics),
        [selectedSections],
    );

    const activeTopics = useMemo(
        () => topics.filter((topic) => availableTopics.includes(topic)),
        [availableTopics, topics],
    );

    const toggleSection = (key: string) => {
        setSections((current) =>
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
        );
    };

    const selectAllSections = () => setSections(catalog.sections.map((section) => section.key));

    const clearSections = () => setSections([]);

    const toggleTopic = (topic: string) => {
        setTopics((current) =>
            current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
        );
    };

    const toggleSectionTopics = (sectionTopics: string[], allSelected: boolean) => {
        setTopics((current) =>
            allSelected
                ? current.filter((topic) => !sectionTopics.includes(topic))
                : [...new Set([...current, ...sectionTopics])],
        );
    };

    const clearTopics = () => setTopics([]);

    const enoughQuestionsPerSection = sections.length === 0 || questions >= sections.length;
    const canGenerate =
        sections.length > 0 && enoughQuestionsPerSection && (tokenStatusUnavailable || hasTokens);

    const secondsPerQuestion = questions > 0 ? Math.round((duration * 60) / questions) : 0;

    const companyLabel =
        catalog.companies.find((item) => item.key === company)?.label || "General Placement";

    const openConfirm = () => {
        if (!sections.length) {
            toast.warn("Select at least 1 section");
            return;
        }

        if (!enoughQuestionsPerSection) {
            toast.warn("Add more questions so every section gets at least one");
            return;
        }

        if (tokenStatus && !hasTokens) {
            toast.warn("No AI test credits left right now. Manual tests are still unlimited.");
            return;
        }

        setConfirmOpen(true);
    };

    const generate = async () => {
        try {
            setLoading(true);
            setConfirmOpen(false);

            const res = await fetch(BACKEND_URL + "/api/aptitude/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    sections,
                    topics: activeTopics,
                    difficulty,
                    company,
                    questions,
                    duration,
                }),
            });

            const data = await res.json();

            if (data.aiTokenStatus) {
                setTokenStatus(data.aiTokenStatus as AiTokenStatusType);
            } else {
                await refreshTokenStatus();
            }

            if (!res.ok) {
                toast.warn(data.message || "Could not build this practice set");
                setLoading(false);
                return;
            }

            toast.success("Aptitude set ready");
            await getMe();
            window.location.href = `/main/test/preview/${data.testId}`;
        } catch (err) {
            console.error("Failed to generate aptitude set", err);
            toast.error("Could not build this practice set");
            setLoading(false);
        }
    };

    if (loading || catalogLoading) {
        return <Loader2 />;
    }

    const companyHint = catalog.companies.find((item) => item.key === company)?.hint;

    return (
        <div className="relative pb-2">
            <PageHeading
                eyebrow="Practice set builder"
                icon={Brain}
                title="Design your aptitude round."
                description="Pick the sections and topics you want, match a company pattern, and set the pace. Each build uses 1 AI credit."
                aside={
                    <div className="soft-panel flex items-center gap-3">
                        <TicketCheck size={20} className="text-primary" />
                        <div>
                            <p className="text-xs font-bold uppercase opacity-55">Credits left</p>
                            <p className="text-lg font-extrabold">{tokenStatus?.remaining ?? "--"}</p>
                        </div>
                    </div>
                }
            />

            {tokenStatus && !hasTokens && <AiTokenStatus status={tokenStatus} showManualAction />}

            <StepSection
                step={1}
                title="Choose sections"
                description="Questions are split evenly across every section you tick."
                error={!sections.length ? "Select at least one section to continue." : undefined}
                action={
                    <>
                        <span className="soft-panel px-3! py-2! text-xs font-bold">
                            {sections.length} of {catalog.sections.length} selected
                        </span>
                        <button className="button-secondary h-9 px-4 text-sm" onClick={selectAllSections}>
                            Select all
                        </button>
                        <button
                            className="button-secondary h-9 px-4 text-sm"
                            onClick={clearSections}
                            disabled={!sections.length}
                        >
                            Clear
                        </button>
                    </>
                }
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {catalog.sections.map((section) => (
                        <OptionCard
                            key={section.key}
                            multi
                            selected={sections.includes(section.key)}
                            onSelect={() => toggleSection(section.key)}
                            icon={sectionIcons[section.key] || Brain}
                            title={section.label}
                            description={section.blurb}
                            meta={
                                <span className="soft-panel px-3! py-1!">{section.topics.length} topics</span>
                            }
                        />
                    ))}
                </div>
            </StepSection>

            {availableTopics.length > 0 && (
                <StepSection
                    step={2}
                    title="Narrow down topics"
                    description="Optional. Leave everything untouched to cover the full section syllabus."
                    action={
                        <>
                            <span className="soft-panel px-3! py-2! text-xs font-bold">
                                {activeTopics.length ? `${activeTopics.length} picked` : "All topics"}
                            </span>
                            {activeTopics.length > 0 && (
                                <button className="button-secondary h-9 px-4 text-sm" onClick={clearTopics}>
                                    Clear
                                </button>
                            )}
                        </>
                    }
                >
                    <div className="space-y-5">
                        {selectedSections.map((section) => {
                            const allSelected = section.topics.every((topic) => topics.includes(topic));

                            return (
                                <div key={section.key} className="soft-panel">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-xs font-extrabold uppercase tracking-wide opacity-60">
                                            {section.label}
                                        </p>

                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => toggleSectionTopics(section.topics, allSelected)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    toggleSectionTopics(section.topics, allSelected);
                                                }
                                            }}
                                            className="cursor-pointer text-xs font-bold text-primary hover:underline"
                                        >
                                            {allSelected ? "Unselect all" : "Select all"}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {section.topics.map((topic) => (
                                            <ChoiceChip
                                                key={topic}
                                                label={topic}
                                                selected={activeTopics.includes(topic)}
                                                onSelect={() => toggleTopic(topic)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </StepSection>
            )}

            <StepSection
                step={availableTopics.length > 0 ? 3 : 2}
                title="Match a company pattern"
                description="The paper is tuned to how this company or exam usually sets its aptitude round."
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catalog.companies.map((item) => (
                        <CompactOption
                            key={item.key}
                            selected={company === item.key}
                            onSelect={() => setCompany(item.key)}
                            label={item.label}
                            icon={Briefcase}
                        />
                    ))}
                </div>

                {companyHint && (
                    <div className="soft-panel mt-4 flex gap-3">
                        <Target size={16} className="mt-0.5 shrink-0 text-primary" />
                        <p className="text-xs leading-relaxed opacity-70">{companyHint}</p>
                    </div>
                )}
            </StepSection>

            <StepSection
                step={availableTopics.length > 0 ? 4 : 3}
                title="Set the paper"
                description="Difficulty, length and time limit for this round."
            >
                <div className="grid gap-8 md:grid-cols-3">
                    <SegmentedControl
                        label="Difficulty"
                        value={difficulty}
                        onChange={setDifficulty}
                        options={[
                            { value: "Easy", label: "Easy" },
                            { value: "Medium", label: "Medium" },
                            { value: "Hard", label: "Hard" },
                        ]}
                    />

                    <RangeField
                        label="Questions"
                        value={questions}
                        min={limits.minQuestions}
                        max={limits.maxQuestions}
                        onChange={setQuestions}
                        hint={
                            !enoughQuestionsPerSection
                                ? `Needs at least ${sections.length} questions for ${sections.length} sections.`
                                : undefined
                        }
                    />

                    <RangeField
                        label="Time limit"
                        value={duration}
                        min={limits.minDuration}
                        max={limits.maxDuration}
                        step={5}
                        suffix="min"
                        onChange={setDuration}
                    />
                </div>

                <p className="mt-5 text-sm opacity-65">
                    {secondsPerQuestion} sec per question
                    {sections.length ? ` · ~${Math.floor(questions / sections.length)} questions per section` : ""}
                </p>
            </StepSection>

            <BuilderBar
                items={[
                    {
                        label: "Sections",
                        value: selectedSections.length ? `${selectedSections.length} picked` : "None",
                    },
                    { label: "Topics", value: activeTopics.length ? `${activeTopics.length} picked` : "All" },
                    { label: "Pattern", value: companyLabel },
                    { label: "Paper", value: `${questions} Q · ${duration} min · ${difficulty}` },
                ]}
            >
                <button
                    onClick={openConfirm}
                    disabled={!canGenerate}
                    className={`flex-1 gap-2 lg:flex-none ${!canGenerate ? "cursor-not-allowed opacity-50" : ""}`}
                >
                    <Sparkles size={18} />
                    {tokenStatusUnavailable || hasTokens ? "Build aptitude set" : "No credits left"}
                </button>
            </BuilderBar>

            <AptitudeConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={generate}
                sections={selectedSections.map((section) => section.label)}
                topics={activeTopics}
                difficulty={difficulty}
                questions={questions}
                duration={duration}
                companyLabel={companyLabel}
            />
        </div>
    );
}

function AptitudeConfirmModal({
    open,
    onClose,
    onConfirm,
    sections,
    topics,
    difficulty,
    questions,
    duration,
    companyLabel,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sections: string[];
    topics: string[];
    difficulty: AptitudeDifficulty;
    questions: number;
    duration: number;
    companyLabel: string;
}) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        if (open) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--border) bg-(--bg) p-6 shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    role="button"
                    tabIndex={0}
                    className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:opacity-70"
                    onClick={onClose}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onClose();
                        }
                    }}
                    aria-label="Close confirmation"
                >
                    <X size={18} />
                </div>

                <div className="pr-8">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                        Confirm aptitude set
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">One AI credit will be used.</h2>
                    <p className="mt-2 text-sm opacity-70">
                        You can practice the same set untimed as many times as you want afterwards.
                    </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Pattern</p>
                        <p className="font-extrabold">{companyLabel}</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Difficulty</p>
                        <p className="font-extrabold">{difficulty}</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Questions</p>
                        <p className="font-extrabold">{questions}</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Duration</p>
                        <p className="font-extrabold">{duration} min</p>
                    </div>
                </div>

                <div className="soft-panel mt-3">
                    <p className="text-xs opacity-60">Sections</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {sections.map((section) => (
                            <span
                                key={section}
                                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white"
                            >
                                <Check size={12} strokeWidth={3.5} />
                                {section}
                            </span>
                        ))}
                    </div>

                    <p className="mt-4 text-xs opacity-60">Topics</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {topics.length ? (
                            topics.map((topic) => (
                                <span key={topic} className="rounded-full bg-(--surface) border border-(--border) px-3 py-1 text-xs">
                                    {topic}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs opacity-70">Full section syllabus</span>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button className="button-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="gap-2">
                        <Sparkles size={18} />
                        Confirm and build
                    </button>
                </div>
            </div>
        </div>
    );
}
