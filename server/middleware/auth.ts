import { Request, Response, NextFunction } from "express";
import { sdk } from "../_core/sdk";

/**
 * Middleware that attaches the authenticated user to req.user.
 * Does NOT reject unauthenticated requests — use requireAuth for that.
 */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await sdk.authenticateRequest(req);
    (req as any).user = user ?? null;
  } catch {
    (req as any).user = null;
  }
  next();
}

/**
 * Middleware that requires authentication.
 * Returns 401 if no user is attached.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

/**
 * Get the authenticated user from the request.
 */
export function getUser(req: Request) {
  return (req as any).user ?? null;
}
