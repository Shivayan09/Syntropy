"use client";

import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Camera,
  Crown,
  Mail,
  Phone,
  Save,
  Settings,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type UserForm = {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  college: string;
  semester: string;
  targetRole: string;
  difficulty: string;
  questions: string;
  subjects: string[];
};

type ProfilePayload = {
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  college?: string;
  semester?: number;
  preferences?: {
    targetRole?: string;
    difficulty?: string;
    questionsPerTest?: number;
    subjects?: string[];
  };
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const semesterLabel = (value: string) => {
  if (!value) return "Not set";
  if (value === "1") return "1st semester";
  if (value === "2") return "2nd semester";
  if (value === "3") return "3rd semester";
  return `${value}th semester`;
};

const planMeta = {
  free: {
    label: "Free",
    note: "3 total AI trial tests",
  },
  starter: {
    label: "Starter",
    note: "15 AI tests each month",
  },
  pro: {
    label: "Pro",
    note: "50 AI tests each month",
  },
  power: {
    label: "Power",
    note: "150 AI tests each month",
  },
} as const;

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [original, setOriginal] = useState<UserForm | null>(null);
  const [form, setForm] = useState<UserForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const normalized: UserForm = {
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      avatar: user.avatar || "",
      college: user.college || "",
      semester: user.semester?.toString() || "",
      targetRole: user.preferences?.targetRole || "",
      difficulty: user.preferences?.difficulty || "Medium",
      questions: user.preferences?.questionsPerTest?.toString() || "20",
      subjects: user.preferences?.subjects || [],
    };

    setOriginal(normalized);
    setForm(normalized);
  }, [user]);

  useEffect(() => {
    if (!form || !original) return;
    setDirty(JSON.stringify(form) !== JSON.stringify(original));
  }, [form, original]);

  const updateForm = (patch: Partial<UserForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!form) return;

      const file = event.target.files?.[0];
      if (!file) return;

      const preview = URL.createObjectURL(file);
      updateForm({ avatar: preview });

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(BACKEND_URL + "/api/user/update-avatar", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.warn(data.message);
        return;
      }

      updateForm({ avatar: data.avatar });
      toast.success("Photo updated");
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error("Upload failed");
    }
  };

  const handleSave = async () => {
    try {
      if (!form || !original) return;
      setSaving(true);

      const payload: ProfilePayload = {};

      if (form.name !== original.name) payload.name = form.name;
      if (form.username !== original.username) payload.username = form.username;
      if (form.email !== original.email) payload.email = form.email;
      if (form.phone !== original.phone) payload.phoneNumber = form.phone;
      if (form.college !== original.college) payload.college = form.college;
      if (form.semester !== original.semester) payload.semester = Number(form.semester);

      const preferences: ProfilePayload["preferences"] = {};

      if (form.targetRole !== original.targetRole) preferences.targetRole = form.targetRole;
      if (form.difficulty !== original.difficulty) preferences.difficulty = form.difficulty;
      if (form.questions !== original.questions) preferences.questionsPerTest = Number(form.questions);
      if (JSON.stringify(form.subjects) !== JSON.stringify(original.subjects)) {
        preferences.subjects = form.subjects;
      }

      if (Object.keys(preferences).length) payload.preferences = preferences;

      if (!Object.keys(payload).length) return;

      const res = await fetch(BACKEND_URL + "/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.warn(data.message);
        return;
      }

      toast.success("Profile updated");
      setOriginal(form);
      setDirty(false);
    } catch (error) {
      console.error("Profile update failed", error);
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (!form) return;

    const subject = subjectInput.trim();
    if (!subject || form.subjects.includes(subject)) return;

    updateForm({ subjects: [...form.subjects, subject] });
    setSubjectInput("");
  };

  const removeSubject = (subject: string) => {
    if (!form) return;
    updateForm({ subjects: form.subjects.filter((item) => item !== subject) });
  };

  if (loading) {
    return <Loader2 />;
  }

  if (!form) {
    return null;
  }

  const activePlan = planMeta[user?.plan || "free"];
  const billingState =
    user?.plan === "free"
      ? "No billing"
      : user?.planBillingCycle === "annual"
        ? "Annual"
        : "Monthly";

  return (
    <div className="mx-auto space-y-7">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Settings size={18} />
            Settings
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`gap-2 ${!dirty || saving ? "cursor-not-allowed opacity-55" : ""}`}
        >
          <Save size={18} />
          {saving ? "Saving" : dirty ? "Save changes" : "Saved"}
        </button>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="card2 p-6 md:p-7 w-full md:w-1/2">
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-black bg-(--surface) shadow-[4px_4px_0px_black]">
                {!imgLoaded && (
                  <div className="absolute inset-0 grid place-items-center bg-(--bg-secondary) text-xs font-bold opacity-70">
                    photo
                  </div>
                )}
                <Image
                  alt={`${form.name || "User"} avatar`}
                  src={
                    form.avatar ||
                    `https://picsum.photos/seed/${encodeURIComponent(form.email || form.name || "user")}/200`
                  }
                  fill
                  unoptimized
                  onLoad={() => setImgLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                />
              </div>

              <div className="min-w-0 w-full">
                <div className="flex items-center justify-end">
                  <div className="mb-3 inline-flex items-center gap-2 border border-black bg-primary px-3 py-1 text-xs font-extrabold uppercase text-white shadow-[3px_3px_0px_black]">
                    <Crown size={14} />
                    {activePlan.label} Plan
                  </div>
                </div>
                <p className="truncate text-2xl font-extrabold">{form.name || "Unnamed user"}</p>
                <p className="truncate text-sm opacity-65 mt-2">{form.email || "No email"}</p>

                <button className="button-secondary mt-4 gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={18} />
                  Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              </div>
            </div>
          </div>

          <div className="card2 p-5 w-full md:w-1/2">
            <p className="text-sm font-bold opacity-60">Profile status</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-70">College</span>
                <span className="font-extrabold">{form.college || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-70">Semester</span>
                <span className="font-extrabold">{semesterLabel(form.semester)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-70">Target</span>
                <span className="font-extrabold">{form.targetRole || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="card p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div>
                <p className="text-sm font-bold opacity-60">Account</p>
                <h2 className="text-2xl font-extrabold">Personal information</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Name</span>
                <input value={form.name} onChange={(event) => updateForm({ name: event.target.value })} className="w-full" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Username</span>
                <input value={form.username} onChange={(event) => updateForm({ username: event.target.value })} className="w-full" />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold opacity-70">
                  <Mail size={16} />
                  Email
                </span>
                <input type="email" value={form.email} onChange={(event) => updateForm({ email: event.target.value })} className="w-full" />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold opacity-70">
                  <Phone size={16} />
                  Phone
                </span>
                <input value={form.phone} onChange={(event) => updateForm({ phone: event.target.value })} className="w-full" />
              </label>
            </div>
          </section>

          <section className="card p-6 md:p-7">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold opacity-60">Education</p>
                  <h2 className="text-2xl font-extrabold">Academic details</h2>
                </div>
              </div>

              <button onClick={() => router.push("/main/profile/education")} className="button-secondary gap-2">
                Syllabus
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 md:col-span-1">
                <span className="text-sm font-bold opacity-70">College</span>
                <input value={form.college} onChange={(event) => updateForm({ college: event.target.value })} className="w-full" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Semester</span>
                <select value={form.semester} onChange={(event) => updateForm({ semester: event.target.value })} className="w-full">
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester.toString()}>
                      {semesterLabel(semester.toString())}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Target role</span>
                <select value={form.targetRole} onChange={(event) => updateForm({ targetRole: event.target.value })} className="w-full">
                  <option value="">Preferred role</option>
                  <option>SDE</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Full Stack</option>
                  <option>Data Analyst</option>
                </select>
              </label>
            </div>
          </section>

          <section className="card p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div>
                <p className="text-sm font-bold opacity-60">Mock test defaults</p>
                <h2 className="text-2xl font-extrabold">Practice preferences</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Default difficulty</span>
                <select value={form.difficulty} onChange={(event) => updateForm({ difficulty: event.target.value })} className="w-full">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold opacity-70">Questions per test</span>
                <select value={form.questions} onChange={(event) => updateForm({ questions: event.target.value })} className="w-full">
                  <option value="10">10 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="25">25 Questions</option>
                  <option value="50">50 Questions</option>
                </select>
              </label>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <p className="font-extrabold">Preferred subjects</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={subjectInput}
                  onChange={(event) => setSubjectInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSubject();
                    }
                  }}
                  placeholder="Add subject..."
                  className="flex-1"
                />
                <button type="button" onClick={addSubject} className="button-secondary">
                  Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {form.subjects.length === 0 ? (
                  <span className="text-sm opacity-65">No preferred subjects added yet.</span>
                ) : (
                  form.subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="button-secondary h-9 rounded-none px-3 text-sm shadow-[3px_3px_0px_black]"
                      title="Remove subject"
                    >
                      {subject}
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
          <section className="card p-6 md:p-7">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold opacity-60">Membership</p>
                <h2 className="text-2xl font-extrabold">Subscription</h2>
                <p className="mt-1 text-sm opacity-70">
                  Your current access level, renewal state, and upgrade controls in one place.
                </p>
              </div>

              <button onClick={() => router.push("/main/subscription")} className="button-secondary gap-2">
                Manage
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="card p-5 md:p-6">
                <div className="flex flex-col sm:items-start md:items-center gap-5 sm:flex-row sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 border border-black bg-primary px-3 py-1 text-xs font-extrabold uppercase text-white shadow-[3px_3px_0px_black]">
                      <Crown size={14} />
                      {activePlan.label} Membership
                    </div>
                    <p className="mt-4 text-3xl font-extrabold">{activePlan.label}</p>
                    <p className="mt-2 text-sm font-semibold opacity-80">{activePlan.note}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
                      <p className="text-xs font-bold uppercase opacity-60">Access status</p>
                      <p className="mt-2 text-lg font-extrabold">
                        {user?.plan === "free" ? "Trial" : "Paid"}
                      </p>
                    </div>
                    <div className="border border-black bg-(--surface) p-4 shadow-[3px_3px_0px_var(--shadow)]">
                      <p className="text-xs font-bold uppercase opacity-60">Billing state</p>
                      <p className="mt-2 text-lg font-extrabold">{billingState}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 md:p-6">
                <p className="text-sm font-bold opacity-60">Plan details</p>
                <div className="mt-4 inline-flex items-center gap-2 border border-black bg-(--surface) px-3 py-1 text-xs font-extrabold uppercase shadow-[3px_3px_0px_var(--shadow)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {user?.plan === "free"
                    ? "Free trial access"
                    : user?.planBillingCycle === "annual"
                      ? "Annual subscription"
                      : "Monthly subscription"}
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="opacity-70">Valid till</span>
                    <span className="text-right font-extrabold">
                      {user?.planExpiry
                        ? new Date(user.planExpiry).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "Not applicable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
