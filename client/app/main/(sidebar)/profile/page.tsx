"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import Loader2 from "@/components/Loader2";

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

export default function Profile() {
  const { user, loading } = useAuth();
  const [original, setOriginal] = useState<UserForm | null>(null);
  const [form, setForm] = useState<UserForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
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
    if (!form || !original) {
      return;
    }
    setDirty(JSON.stringify(form) !== JSON.stringify(original));
  }, [form, original]);

  if(loading) {
    return <Loader2/>
  }
  if (!form) {
    return null;
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      const preview = URL.createObjectURL(file);
      setForm({ ...form, avatar: preview });
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(
        BACKEND_URL + "/api/user/update-avatar",
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.warn(data.message);
        return;
      }
      setForm({ ...form, avatar: data.avatar });
      toast.success("Photo updated");
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error("Upload failed");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(BACKEND_URL + "/api/user/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            username: form.username,
            email: form.email,
            phoneNumber: form.phone,
            college: form.college,
            semester: Number(form.semester),
            preferences: {
              targetRole: form.targetRole,
              difficulty: form.difficulty,
              questionsPerTest: Number(form.questions),
              subjects: form.subjects,
            },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.warn(data.message);
        return;
      }
      toast.success("Profile updated")
      setOriginal(form);
      setDirty(false);
    } catch (error) {
      console.error("Profile update failed", error);
    } finally {
      setSaving(false);
    }
  };

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
    <div>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold">Profile</h1>
        <p className="text-gray-600 text-sm">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 overflow-hidden rounded-full">

          {!imgLoaded && (
            <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-500">
              photo
            </div>
          )}
          <img src={form.avatar || `https://picsum.photos/seed/${encodeURIComponent(form.email || form.name || "user")}/200`} onLoad={() => setImgLoaded(true)} className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`} />
        </div>

        <div>
          <p className="font-bold text-lg">{form.name}</p>
          <p className="text-sm text-gray-600">{form.email}</p>

          <button className="mt-2" onClick={() => fileInputRef.current?.click()}>
            Change Photo
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
        </div>
      </div>

      <section className="mb-8 card2">
        <p className="font-bold mb-4">Account</p>

        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
      </section>

      <section className="mb-8 card2">
        <p className="font-bold mb-4">Educational Info</p>

        <div className="grid md:grid-cols-3 gap-4">

          <input placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />

          <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} > <option value="">Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} >
            <option value="">Preferred Role</option>
            <option>SDE</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>Full Stack</option>
            <option>Data Analyst</option>
          </select>

        </div>
      </section>

      <section className="mb-8 card2">
        <p className="font-bold mb-4">Test Preferences</p>

        <div className="grid md:grid-cols-2 gap-4">

          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })}>
            <option value="10">10 Questions</option>
            <option value="20">20 Questions</option>
            <option value="25">25 Questions</option>
            <option value="50">50 Questions</option>
          </select>

        </div>
      </section>

      <section className="mb-10 card2">
        <p className="font-bold mb-4">Subjects</p>

        <div className="flex items-center gap-5 mb-3">
          <input placeholder="Add subject" value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} />

          <button className="button-secondary" onClick={addSubject}>
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {form.subjects.map((sub) => (
            <div key={sub} className="border-2 border-black px-3 py-1 flex items-center gap-2 bg-secondary">
              {sub}
              <button onClick={() => removeSubject(sub)} className="h-5! px-1! text-sm">
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={!dirty || saving} className={`px-6 py-2 font-bold ${!dirty ? "opacity-50 cursor-not-allowed" : ""}`}> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </div>
  );
}