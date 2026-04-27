import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/lib/rbac";

type Params = Record<string, string>;
type Ctx<P extends Params = Params> = { params: P };

/**
 * Wrap an API route handler with consistent error handling.
 * Converts thrown errors (Zod, RBAC, etc.) to proper HTTP responses.
 */
export function handle<P extends Params = Params>(
  fn: (req: Request, ctx: Ctx<P>) => Promise<Response>,
): (req: Request, ctx?: Ctx<P>) => Promise<Response> {
  return async (req, ctx) => {
    try {
      return await fn(req, (ctx ?? ({ params: {} as P })) as Ctx<P>);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
      if (err instanceof ForbiddenError) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: err.issues },
          { status: 400 },
        );
      }
      // eslint-disable-next-line no-console
      console.error("[api:error]", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
