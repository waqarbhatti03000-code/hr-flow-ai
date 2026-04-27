import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireAuth();
  const employee = await prisma.employee.findFirst({
    where: { id: params.id, companyId: ctx.companyId },
    include: { department: true },
  });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/employees" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to employees
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
            {initials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-slate-500">{employee.title}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="info">{employee.level}</Badge>
              <Badge
                variant={
                  employee.status === "ACTIVE" ? "success" : employee.status === "ON_LEAVE" ? "warning" : "muted"
                }
              >
                {employee.status.replace("_", " ")}
              </Badge>
              {employee.department ? <Badge variant="muted">{employee.department.name}</Badge> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>How to reach this person.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Email" value={employee.email} />
            <Row label="Country" value={employee.country} />
            <Row label="Hired" value={employee.hiredAt.toLocaleDateString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
            <CardDescription>Role, level, and compensation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Title" value={employee.title} />
            <Row label="Level" value={employee.level} />
            <Row label="Department" value={employee.department?.name ?? "—"} />
            <Row label="Salary" value={formatCurrency(employee.salary, employee.currency)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
