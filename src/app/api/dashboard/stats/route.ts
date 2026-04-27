export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth } from "@/lib/rbac";

export const GET = handle(async () => {
  const ctx = await requireAuth();

  const [totalEmployees, totalDepartments, totalOutputs, active, byDepartment, recent] = await Promise.all([
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
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totals: {
      employees: totalEmployees,
      departments: totalDepartments,
      aiOutputs: totalOutputs,
      activeEmployees: active,
    },
    byDepartment: byDepartment.map((d) => ({
      name: d.name,
      count: d._count.employees,
    })),
    recentOutputs: recent,
  });
});
