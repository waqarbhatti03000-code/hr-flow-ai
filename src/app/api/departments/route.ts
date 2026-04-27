export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/rbac";
import { DepartmentCreate } from "@/lib/validators";

export const GET = handle(async () => {
  const ctx = await requireAuth();
  const departments = await prisma.department.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { name: "asc" },
    include: { _count: { select: { employees: true } } },
  });
  return NextResponse.json({ departments });
});

export const POST = handle(async (req: Request) => {
  const ctx = await requireRole(["HR_MANAGER"]);
  const body = DepartmentCreate.parse(await req.json());

  // Cross-tenant guard: a parent department must belong to this company.
  if (body.parentId) {
    const parent = await prisma.department.findFirst({
      where: { id: body.parentId, companyId: ctx.companyId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
    }
  }

  const department = await prisma.department.create({
    data: { ...body, companyId: ctx.companyId },
  });
  return NextResponse.json({ department }, { status: 201 });
});
