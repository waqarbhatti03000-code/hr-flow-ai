import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { RegisterInput } from "@/lib/validators";

/**
 * Register a new company + admin user. This is a self-service tenant signup.
 */
export const POST = handle(async (req: Request) => {
  const body = RegisterInput.parse(await req.json());
  const email = body.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: body.companyName, country: "PK", size: "SMB" },
    });
    return tx.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "ADMIN",
        companyId: company.id,
      },
    });
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
});
