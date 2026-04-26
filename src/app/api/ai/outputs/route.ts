export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireAuth } from "@/lib/rbac";

export const GET = handle(async (req: Request) => {
  const ctx = await requireAuth();
  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get("limit") ?? 10));

  const outputs = await prisma.aiOutput.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ outputs });
});
