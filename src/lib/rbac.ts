import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  status = 401;
}
export class ForbiddenError extends Error {
  status = 403;
}

export type AuthContext = {
  userId: string;
  companyId: string;
  role: Role;
  email: string;
};

/**
 * Get the current session context for an API route or server component.
 * Throws UnauthorizedError if not logged in.
 */
export async function requireAuth(): Promise<AuthContext> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError("Not authenticated");
  return {
    userId: session.user.id,
    companyId: session.user.companyId,
    role: session.user.role,
    email: session.user.email ?? "",
  };
}

/**
 * Require one of the given roles. ADMIN is always allowed.
 */
export async function requireRole(roles: Role[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (ctx.role === "ADMIN") return ctx;
  if (!roles.includes(ctx.role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")}`);
  }
  return ctx;
}

export function can(role: Role, action: "manage:employees" | "use:ai-toolkit" | "view:dashboard"): boolean {
  switch (action) {
    case "manage:employees":
    case "use:ai-toolkit":
      return role === "ADMIN" || role === "HR_MANAGER";
    case "view:dashboard":
      return true;
  }
}
