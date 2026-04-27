import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { RegisterInput } from "@/lib/validators";

/**
 * Register a new company + admin user. This is a self-service tenant signup.
 *
 * The unique-email check is enforced both at the application layer (fast path,
 * friendlier error) and at the DB layer (prevents the TOCTOU race between two
 * concurrent registrations). Both the company create and user create run inside
 * a single transaction so a failed user.create rolls back the orphan company.
 */
export const POST = handle(async (req: Request) => {
  const body = RegisterInput.parse(await req.json());
  const email = body.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  try {
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
  } catch (err) {
    // Two concurrent registrations may both pass the findUnique check above;
    // the unique constraint on User.email guarantees only one wins.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    throw err;
  }
});
