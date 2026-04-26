"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { SalaryBand } from "@/lib/ai/types";

export function SalaryBandGenerator() {
  const [form, setForm] = useState({
    role: "Software Engineer",
    level: "Senior",
    country: "PK",
    remote: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<SalaryBand | null>(null);
  const [model, setModel] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/salary-band", {
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
        <div className="space-y-1.5">
          <Label>Level</Label>
          <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {["Junior", "Mid", "Senior", "Lead", "Manager", "Director"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Country (ISO-2)</Label>
          <Input
            maxLength={2}
            required
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(e) => setForm({ ...form, remote: e.target.checked })}
          />
          Fully remote engagement
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating…" : "Generate salary band"}
        </Button>
      </form>

      <div className="lg:col-span-3">
        {output ? (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {output.level} {output.role} — {output.country}
              </h2>
              {model ? <Badge variant="info">{model}</Badge> : null}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(["p25", "p50", "p75", "p90"] as const).map((k) => (
                <div key={k} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{k.toUpperCase()}</div>
                  <div className="mt-1 font-semibold">
                    {formatCurrency(output.bands[k], output.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900">Rationale</h3>
              <p className="mt-1 text-sm text-slate-700">{output.rationale}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900">Sources</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {output.sources.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Generated salary band will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
