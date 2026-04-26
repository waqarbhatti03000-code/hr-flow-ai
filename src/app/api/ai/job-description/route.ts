import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireRole } from "@/lib/rbac";
import { JDInput } from "@/lib/validators";
import { generateJobDescription } from "@/lib/ai/generators";

export const POST = handle(async (req: Request) => {
  const ctx = await requireRole(["HR_MANAGER"]);
  const input = JDInput.parse(await req.json());
  const { data, model } = await generateJobDescription(input);

  const saved = await prisma.aiOutput.create({
    data: {
      kind: "JOB_DESCRIPTION",
      title: data.title,
      input,
      output: data as unknown as object,
      model,
      companyId: ctx.companyId,
      createdById: ctx.userId,
    },
  });

  return NextResponse.json({ output: data, id: saved.id, model }, { status: 201 });
});
