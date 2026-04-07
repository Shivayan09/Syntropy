"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type UserForm = {
  name: string;
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

export default function Profile() {
  const { user, loading } = useAuth();

  const [original, setOriginal] = useState<UserForm | null>(null);
  const [form, setForm] = useState<UserForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const normalized: UserForm = {
      name: user.name || "",
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

  if (loading || !form) return null;

  const addSubject = () => {
    if (!subjectInput.trim()) return;
    if (form.subjects.includes(subjectInput)) return;

    setForm({
      ...form,
      subjects: [...form.subjects, subjectInput],
    });

    setSubjectInput("");
  };

  const removeSubject = (sub: string) => {
    setForm({
      ...form,
      subjects: form.subjects.filter((s) => s !== sub),
    });
  };

  return (
    <div className="mx-auto px-5 pt-20 md:pt-8 md:px-10 py-8">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold">Profile</h1>
        <p className="text-gray-600 text-sm">
          Manage your account and preferences
        </p>
      </div>

      {/* AVATAR */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24">

          {!imgLoaded && (
            <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-500">
              photo
            </div>
          )}

          <img
            src={form.avatar || `https://picsum.photos/seed/${encodeURIComponent(form.email || form.name || "user")}/200`}
            onLoad={() => setImgLoaded(true)}
            className={`w-24 h-24 rounded-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}/>
        </div>

        <div>
          <p className="font-bold text-lg">{form.name}</p>
          <p className="text-sm text-gray-600">{form.email}</p>

          <button className="mt-2">
            Change Photo
          </button>
        </div>
      </div>

      {/* ACCOUNT */}
      <section className="mb-8 card2">
        <p className="font-bold mb-4">Account</p>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />
        </div>
      </section>

      {/* EDUCATION */}
      <section className="mb-8 card2">
        <p className="font-bold mb-4">Educational Info</p>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            placeholder="College"
            value={form.college}
            onChange={(e) =>
              setForm({ ...form, college: e.target.value })
            }
          />

          <select
            value={form.semester}
            onChange={(e) =>
              setForm({ ...form, semester: e.target.value })
            }
          >
            <option value="">Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={form.targetRole}
            onChange={(e) =>
              setForm({ ...form, targetRole: e.target.value })
            }
          >
            <option value="">Preferred Role</option>
            <option>SDE</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>Full Stack</option>
            <option>Data Analyst</option>
          </select>

        </div>
      </section>

      {/* TEST PREFERENCES */}
      <section className="mb-8 card2">
        <p className="font-bold mb-4">Test Preferences</p>

        <div className="grid md:grid-cols-2 gap-4">

          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm({ ...form, difficulty: e.target.value })
            }
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={form.questions}
            onChange={(e) =>
              setForm({ ...form, questions: e.target.value })
            }
          >
            <option value="10">10 Questions</option>
            <option value="20">20 Questions</option>
            <option value="25">25 Questions</option>
            <option value="50">50 Questions</option>
          </select>

        </div>
      </section>

      {/* SUBJECTS */}
      <section className="mb-10 card2">
        <p className="font-bold mb-4">Subjects</p>

        <div className="flex items-center gap-5 mb-3">
          <input
            placeholder="Add subject"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
          />

          <button className="button-secondary" onClick={addSubject}>
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.subjects.map((sub) => (
            <div
              key={sub}
              className="px-3 py-1 card bg-stone-100 text-sm flex items-center gap-2"
            >
              {sub}
              <p
                onClick={() => removeSubject(sub)}
                className="cursor-pointer"
              >
                ×
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          disabled={!dirty}
          className={`px-6 py-2 font-bold
            ${!dirty ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          Save Changes
        </button>
      </div>

    </div>
  );
}