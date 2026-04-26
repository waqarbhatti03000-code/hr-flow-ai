import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireRole } from "@/lib/rbac";
import { OrgInput } from "@/lib/validators";
import { generateOrgStructure } from "@/lib/ai/generators";

export const POST = handle(async (req: Request) => {
  const ctx = await requireRole(["HR_MANAGER"]);
  const input = OrgInput.parse(await req.json());
  const { data, model } = await generateOrgStructure(input);

  const saved = await prisma.aiOutput.create({
    data: {
      kind: "ORG_STRUCTURE",
      title: `${input.companyName} org chart (${input.companySize})`,
      input,
      output: data as unknown as object,
      model,
      companyId: ctx.companyId,
      createdById: ctx.userId,
    },
  });

  return NextResponse.json({ output: data, id: saved.id, model }, { status: 201 });
});
