export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth } from "@/lib/rbac";

export const GET = handle(async (req: Request) => {
  const ctx = await requireAuth();
  const url = new URL(req.url);
  const raw = Number(url.searchParams.get("limit") ?? 10);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(50, Math.floor(raw)) : 10;

  const outputs = await prisma.aiOutput.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ outputs });
});
