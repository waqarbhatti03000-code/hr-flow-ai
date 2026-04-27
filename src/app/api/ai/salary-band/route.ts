import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireRole } from "@/lib/rbac";
import { SalaryInput } from "@/lib/validators";
import { generateSalaryBand } from "@/lib/ai/generators";

export const POST = handle(async (req: Request) => {
  const ctx = await requireRole(["HR_MANAGER"]);
  const input = SalaryInput.parse(await req.json());
  const { data, model } = await generateSalaryBand(input);

  const saved = await prisma.aiOutput.create({
    data: {
      kind: "SALARY_BAND",
      title: `${input.level} ${input.role} — ${input.country}`,
      input,
      output: data as unknown as object,
      model,
      companyId: ctx.companyId,
      createdById: ctx.userId,
    },
  });

  return NextResponse.json({ output: data, id: saved.id, model }, { status: 201 });
});
