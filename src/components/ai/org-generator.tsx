"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { OrgChart, OrgNode } from "@/lib/ai/types";

export function OrgStructureGenerator() {
  const [form, setForm] = useState({
    companyName: "Acme SME",
    companySize: 50,
    departments: "Engineering, Product, Design, Sales, Marketing, People",
    country: "PK",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<OrgChart | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      companyName: form.companyName,
      companySize: Number(form.companySize),
      departments: form.departments.split(",").map((s) => s.trim()).filter(Boolean),
      country: form.country || undefined,
    };
    const res = await fetch("/api/ai/org-structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
          <Label>Company name</Label>
          <Input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Target headcount</Label>
          <Input
            type="number"
            min={1}
            max={10000}
            required
            value={form.companySize}
            onChange={(e) => setForm({ ...form, companySize: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Departments (comma-separated)</Label>
          <Input value={form.departments} onChange={(e) => setForm({ ...form, departments: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Country (ISO-2, optional)</Label>
          <Input maxLength={2} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating…" : "Generate org chart"}
        </Button>
      </form>

      <div className="lg:col-span-3">
        {output ? (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{output.companyName}</h2>
              <div className="flex items-center gap-2">
                {model ? <Badge variant="info">{model}</Badge> : null}
                <Button variant="outline" size="sm" onClick={() => setShowJson((v) => !v)}>
                  {showJson ? "Tree view" : "JSON view"}
                </Button>
              </div>
            </div>
            {showJson ? (
              <pre className="max-h-96 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <OrgTree node={output.root} />
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Generated org chart will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

function OrgTree({ node }: { node: OrgNode }) {
  return (
    <ul className="space-y-1.5">
      <li>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
          <span className="font-medium">{node.name}</span>
          <Badge variant="muted">{node.headcount}</Badge>
        </div>
        {node.children?.length ? (
          <ul className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-4">
            {node.children.map((c, i) => (
              <li key={i}>
                <OrgTree node={c} />
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    </ul>
  );
}
