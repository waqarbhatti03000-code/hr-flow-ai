export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/rbac";
import { EmployeeCreate } from "@/lib/validators";

export const GET = handle(async () => {
  const ctx = await requireAuth();
  const employees = await prisma.employee.findMany({
    where: { companyId: ctx.companyId },
    orderBy: [{ department: { name: "asc" } }, { lastName: "asc" }],
    include: { department: true },
  });
  return NextResponse.json({ employees });
});

export const POST = handle(async (req: Request) => {
  const ctx = await requireRole(["HR_MANAGER"]);
  const input = EmployeeCreate.parse(await req.json());

  // Cross-tenant guard: a department referenced from this company's data must
  // also belong to this company. The FK alone only validates existence.
  if (input.departmentId) {
    const dept = await prisma.department.findFirst({
      where: { id: input.departmentId, companyId: ctx.companyId },
      select: { id: true },
    });
    if (!dept) {
      return NextResponse.json({ error: "Invalid departmentId" }, { status: 400 });
    }
  }

  const employee = await prisma.employee.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
      companyId: ctx.companyId,
    },
    include: { department: true },
  });

  return NextResponse.json({ employee }, { status: 201 });
});
