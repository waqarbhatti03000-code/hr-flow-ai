"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export function NewEmployeeForm({ departments }: { departments: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    level: "Mid",
    country: "PK",
    currency: "PKR",
    salary: "",
    status: "ACTIVE",
    departmentId: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      title: form.title,
      level: form.level,
      status: form.status as "ACTIVE" | "ON_LEAVE" | "TERMINATED",
      country: form.country,
      currency: form.currency,
      salary: form.salary ? Number(form.salary) : null,
      departmentId: form.departmentId || null,
    };
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to create employee");
      return;
    }
    router.push("/employees");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>First name</Label>
        <Input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Last name</Label>
        <Input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Email</Label>
        <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input required value={form.title} onChange={(e) => update("title", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Level</Label>
        <Select value={form.level} onChange={(e) => update("level", e.target.value)}>
          {["Junior", "Mid", "Senior", "Lead", "Manager", "Director"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Department</Label>
        <Select value={form.departmentId} onChange={(e) => update("departmentId", e.target.value)}>
          <option value="">Unassigned</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="TERMINATED">Terminated</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Country (ISO-2)</Label>
        <Input maxLength={2} value={form.country} onChange={(e) => update("country", e.target.value.toUpperCase())} />
      </div>
      <div className="space-y-1.5">
        <Label>Currency (ISO-3)</Label>
        <Input maxLength={3} value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Annual salary (optional)</Label>
        <Input
          type="number"
          min={0}
          value={form.salary}
          onChange={(e) => update("salary", e.target.value)}
          placeholder="1800000"
        />
      </div>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Create employee"}
        </Button>
      </div>
    </form>
  );
}
