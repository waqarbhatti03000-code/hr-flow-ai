import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const ctx = await requireAuth();
  const employees = await prisma.employee.findMany({
    where: { companyId: ctx.companyId },
    orderBy: [{ department: { name: "asc" } }, { lastName: "asc" }],
    include: { department: true },
  });
  const canManage = can(ctx.role, "manage:employees");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500">{employees.length} people in your workspace.</p>
        </div>
        {canManage ? (
          <Link href="/employees/new">
            <Button>
              <Plus className="h-4 w-4" /> Add employee
            </Button>
          </Link>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>All employees across departments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Salary</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <Link href={`/employees/${e.id}`} className="flex items-center gap-3 font-medium text-slate-900 hover:text-brand-700">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                          {initials(`${e.firstName} ${e.lastName}`)}
                        </div>
                        <div>
                          <div>{e.firstName} {e.lastName}</div>
                          <div className="text-xs text-slate-500">{e.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{e.title}</td>
                    <td className="px-5 py-3 text-slate-700">{e.department?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-700">{e.level}</td>
                    <td className="px-5 py-3 text-slate-700">{formatCurrency(e.salary ?? null, e.currency)}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          e.status === "ACTIVE" ? "success" : e.status === "ON_LEAVE" ? "warning" : "muted"
                        }
                      >
                        {e.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                      No employees yet. Add one to get started.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
