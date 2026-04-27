import { redirect } from "next/navigation";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrgStructureGenerator } from "@/components/ai/org-generator";

export default async function OrgStructurePage() {
  const ctx = await requireAuth();
  if (!can(ctx.role, "use:ai-toolkit")) redirect("/dashboard");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI · Organizational Structure</h1>
        <p className="text-sm text-slate-500">
          Design a lean org chart for your target headcount.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>New generation</CardTitle>
          <CardDescription>Based on company size and departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgStructureGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
