/**
 * End-to-end test for the GET /api/employees handler.
 *
 * We mock the Prisma client and the auth helper, then invoke the exported
 * route handler directly — this verifies the handler returns the right shape
 * and wires the authenticated company into the DB query.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub next-auth so we don't pull the whole auth stack into Node ESM.
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => null),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rbac", () => {
  class UnauthorizedError extends Error {}
  class ForbiddenError extends Error {}
  const ctx = {
    userId: "user-1",
    companyId: "company-1",
    role: "HR_MANAGER" as const,
    email: "hr@acme.test",
  };
  return {
    UnauthorizedError,
    ForbiddenError,
    requireAuth: vi.fn(async () => ctx),
    requireRole: vi.fn(async () => ctx),
    can: () => true,
  };
});

import { prisma } from "@/lib/db";
import { GET } from "@/app/api/employees/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/employees", () => {
  it("returns the employees scoped to the user's company", async () => {
    const rows = [
      {
        id: "emp-1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@acme.test",
        title: "Engineer",
        level: "Senior",
        status: "ACTIVE",
        country: "PK",
        salary: 3_000_000,
        currency: "PKR",
        hiredAt: new Date(),
        companyId: "company-1",
        departmentId: "dept-1",
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: { id: "dept-1", name: "Engineering" },
      },
    ];
    (prisma.employee.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(rows);

    const res = await GET(new Request("http://localhost/api/employees"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.employees).toHaveLength(1);
    expect(body.employees[0].firstName).toBe("Ada");
    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1" } }),
    );
  });
});
