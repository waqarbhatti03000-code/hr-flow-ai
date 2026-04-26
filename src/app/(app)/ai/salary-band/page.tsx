import { redirect } from "next/navigation";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalaryBandGenerator } from "@/components/ai/salary-generator";

export default async function SalaryBandPage() {
  const ctx = await requireAuth();
  if (!can(ctx.role, "use:ai-toolkit")) redirect("/dashboard");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI · Salary Band</h1>
        <p className="text-sm text-slate-500">
          Country-aware compensation benchmarks by role and level.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>New generation</CardTitle>
          <CardDescription>Returns percentile-based bands.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalaryBandGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
