"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { JobDescription } from "@/lib/ai/types";

export function JobDescriptionGenerator() {
  const [form, setForm] = useState({
    role: "Software Engineer",
    level: "Senior",
    department: "Engineering",
    country: "PK",
    extraContext: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<JobDescription | null>(null);
  const [model, setModel] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/job-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to generate");
      return;
    }
    const data = await res.json();
    setOutput(data.output);
    setModel(data.model);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={onSubmit} className="space-y-3 lg:col-span-2">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Level</Label>
            <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {["Junior", "Mid", "Senior", "Lead", "Manager", "Director"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Country (ISO-2)</Label>
          <Input maxLength={2} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} />
        </div>
        <div className="space-y-1.5">
          <Label>Extra context (optional)</Label>
          <Textarea
            placeholder="e.g. remote-first startup building an HR SaaS…"
            value={form.extraContext}
            onChange={(e) => setForm({ ...form, extraContext: e.target.value })}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating…" : "Generate JD"}
        </Button>
      </form>

      <div className="lg:col-span-3">
        {output ? (
          <article className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{output.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{output.summary}</p>
              </div>
              {model ? <Badge variant="info">{model}</Badge> : null}
            </header>
            <Section title="Responsibilities" items={output.responsibilities} />
            <Section title="Requirements" items={output.requirements} />
            {output.niceToHave.length ? <Section title="Nice to have" items={output.niceToHave} /> : null}
            {output.benefits.length ? <Section title="Benefits" items={output.benefits} /> : null}
            {output.keywords.length ? (
              <div>
                <h3 className="text-sm font-medium text-slate-900">Keywords</h3>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {output.keywords.map((k) => (
                    <Badge key={k} variant="muted">{k}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Generated JD will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}
