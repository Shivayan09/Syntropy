"use client";

import { useEffect, useState } from "react";
import Loader2 from "@/components/Loader2";

export default function SyllabusPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchSyllabus = async () => {
    try {
      const res = await fetch(
        BACKEND_URL + "/api/syllabus/my",
        { credentials: "include" }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);
        data = { syllabus: [] };
      }

      setSyllabus(data.syllabus || []);

    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const upload = async () => {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setLoading(true);

    try {
      const res = await fetch(
        BACKEND_URL + "/api/syllabus/upload",
        {
          method: "POST",
          body: form,
          credentials: "include"
        }
      );

      const text = await res.text();

      try {
        JSON.parse(text);
      } catch {
        console.error("Upload failed:", text);
      }

      setFile(null);
      fetchSyllabus();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loader2 />;
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-extrabold">
          Syllabus
        </h1>

        <p className="text-sm opacity-70">
          Upload PDF or image to auto-generate syllabus
        </p>
      </div>

      {/* UPLOAD */}
      <div className="card space-y-4">

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="flex gap-3 items-center">
          <button onClick={upload} disabled={!file || loading}>
            Upload Syllabus
          </button>

          {file && (
            <span className="text-sm opacity-70">
              {file.name}
            </span>
          )}
        </div>

      </div>

      {loading && <Loader2 />}

      {/* LIST */}
      <div className="space-y-4">
        {syllabus.map((s) => (
          <div
            key={s._id}
            className="card flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
            onClick={() => setActive(s)}
          >
            <div>
              <p className="font-extrabold">
                {s.title}
              </p>

              <p className="text-sm opacity-70">
                {s.units?.length || 0} units
              </p>
            </div>

            <button
              className="button-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setActive(s);
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* VIEW */}
      {active && (
        <div className="card space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold">
              {active.title}
            </h2>

            <button
              className="button-secondary"
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </div>

          <div className="space-y-5">
            {active.subjects?.map((subject: any, si: number) => (
  <div key={si} className="space-y-4">

    <p className="font-extrabold text-lg">
      {subject.name}
    </p>

    {subject.units?.map((unit: any, i: number) => (
      <div key={i} className="card">

        <p className="font-extrabold mb-3">
          {unit.title}
        </p>

        <div className="grid md:grid-cols-2 gap-2">
          {unit.topics.map((t: any, j: number) => (
            <div key={j} className="border p-2 text-sm">
              {t.name}
            </div>
          ))}
        </div>

      </div>
    ))}

  </div>
))}
          </div>

        </div>
      )}

    </div>
  );
}