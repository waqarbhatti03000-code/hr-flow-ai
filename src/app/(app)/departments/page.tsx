import { prisma } from "@/lib/db";
import { requireAuth, can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewDepartmentForm } from "@/components/employees/new-department-form";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const ctx = await requireAuth();
  const departments = await prisma.department.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { name: "asc" },
    include: { _count: { select: { employees: true } } },
  });
  const canManage = can(ctx.role, "manage:employees");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-slate-500">Logical groupings of your workforce.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
          {departments.map((d) => (
            <Card key={d.id}>
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.name}</div>
                  <Badge variant="muted">{d._count.employees} people</Badge>
                </div>
                {d.description ? (
                  <p className="mt-2 text-sm text-slate-600">{d.description}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {departments.length === 0 ? (
            <Card className="sm:col-span-2">
              <CardContent className="py-8 text-center text-sm text-slate-500">
                No departments yet.
              </CardContent>
            </Card>
          ) : null}
        </div>

        {canManage ? (
          <Card>
            <CardHeader>
              <CardTitle>Add department</CardTitle>
              <CardDescription>Create a new department for your company.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewDepartmentForm />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
