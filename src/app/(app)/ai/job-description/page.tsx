import { redirect } from "next/navigation";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JobDescriptionGenerator } from "@/components/ai/jd-generator";

export default async function JobDescriptionPage() {
  const ctx = await requireAuth();
  if (!can(ctx.role, "use:ai-toolkit")) redirect("/dashboard");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI · Job Description</h1>
        <p className="text-sm text-slate-500">
          Generate a structured, inclusive JD for any role in seconds.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>New generation</CardTitle>
          <CardDescription>Fill in the role, level, and department.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobDescriptionGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
