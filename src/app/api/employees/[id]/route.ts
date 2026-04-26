import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/rbac";
import { EmployeeUpdate } from "@/lib/validators";

type Ctx = { params: { id: string } };

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const auth = await requireAuth();
  const employee = await prisma.employee.findFirst({
    where: { id: ctx.params.id, companyId: auth.companyId },
    include: { department: true },
  });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ employee });
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const auth = await requireRole(["HR_MANAGER"]);
  const body = EmployeeUpdate.parse(await req.json());

  const existing = await prisma.employee.findFirst({
    where: { id: ctx.params.id, companyId: auth.companyId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const employee = await prisma.employee.update({
    where: { id: existing.id },
    data: {
      ...body,
      ...(body.email ? { email: body.email.toLowerCase() } : {}),
    },
    include: { department: true },
  });
  return NextResponse.json({ employee });
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const auth = await requireRole(["HR_MANAGER"]);
  const existing = await prisma.employee.findFirst({
    where: { id: ctx.params.id, companyId: auth.companyId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.employee.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
});
