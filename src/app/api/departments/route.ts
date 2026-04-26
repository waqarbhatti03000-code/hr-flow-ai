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
  const department = await prisma.department.create({
    data: { ...body, companyId: ctx.companyId },
  });
  return NextResponse.json({ department }, { status: 201 });
});
