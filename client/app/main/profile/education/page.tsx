"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Loader2 from "@/components/Loader2";
import SyllabusManager from "@/components/main/SyllabusManager";

type EducationForm = {
  college: string;
  semester: string;
  targetRole: string;
};

export default function Education() {
  const { user, loading } = useAuth();

  const [form, setForm] = useState<EducationForm>({
    college: "",
    semester: "",
    targetRole: "",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      college: user.college || "",
      semester: user.semester?.toString() || "",
      targetRole: user.preferences?.targetRole || "",
    });
  }, [user]);

  if (loading) return <Loader2 />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">
          Educational Info
        </h1>
        <p className="text-sm opacity-70 mt-2">
          Manage your academic details
        </p>
      </div>

      <section>
        <p className="font-bold mb-4">College and Semester</p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">

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
              <option key={s} value={s}>
                {s}
              </option>
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
        <SyllabusManager/>
      </section>

    </div>
  );
}