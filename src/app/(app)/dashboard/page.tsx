import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { Stat, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentBarChart } from "@/components/dashboard/dept-chart";
import { RecentOutputs } from "@/components/dashboard/recent-outputs";
import { Users, Building2, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requireAuth();

  const [employeeCount, departmentCount, aiCount, active, byDept, recent] = await Promise.all([
    prisma.employee.count({ where: { companyId: ctx.companyId } }),
    prisma.department.count({ where: { companyId: ctx.companyId } }),
    prisma.aiOutput.count({ where: { companyId: ctx.companyId } }),
    prisma.employee.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }),
    prisma.department.findMany({
      where: { companyId: ctx.companyId },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.aiOutput.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const chartData = byDept.map((d) => ({ name: d.name, count: d._count.employees }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">Company overview and recent activity.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total employees" value={employeeCount} hint={`${active} active`} />
        <Stat label="Departments" value={departmentCount} />
        <Stat label="AI outputs generated" value={aiCount} />
        <Stat
          label="Headcount by dept"
          value={chartData.length}
          hint={chartData.length ? `Largest: ${chartData.reduce((a, b) => (a.count > b.count ? a : b)).name}` : "—"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              Employees by department
            </CardTitle>
            <CardDescription>Snapshot of your workforce distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentBarChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-500" />
              Recent AI outputs
            </CardTitle>
            <CardDescription>Last {recent.length} generations.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOutputs outputs={recent.map((o) => ({
              id: o.id,
              kind: o.kind,
              title: o.title,
              model: o.model,
              createdAt: o.createdAt.toISOString(),
            }))} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byDept.map((d) => (
          <Card key={d.id}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{d.name}</span>
                </div>
                <Badge variant="muted">{d._count.employees} people</Badge>
              </div>
              {d.description ? (
                <p className="mt-2 text-sm text-slate-600">{d.description}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Staffed
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
