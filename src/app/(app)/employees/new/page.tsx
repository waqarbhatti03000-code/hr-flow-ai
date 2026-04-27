import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewEmployeeForm } from "@/components/employees/new-employee-form";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage() {
  const ctx = await requireAuth();
  if (!can(ctx.role, "manage:employees")) redirect("/employees");

  const departments = await prisma.department.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employees" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to employees
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add employee</CardTitle>
          <CardDescription>Create a new record in your company directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewEmployeeForm
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
