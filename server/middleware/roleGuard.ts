import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../shared/const";
import { getUser } from "./auth";

type RoleGuardOptions = {
  roles: UserRole[];
  allowSelf?: boolean;
  paramName?: string;
};

/**
 * Middleware that checks if the authenticated user has one of the required roles.
 * Returns 403 if the user doesn't have the required role.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient role permissions" });
    }
    next();
  };
}

/**
 * Middleware that checks if the user has one of the required roles or is the resource owner.
 * ownerCheck receives the user and the route param to determine ownership.
 */
export function requireRoleOrOwner(
  options: RoleGuardOptions,
  ownerCheck: (userId: number, paramValue: string) => Promise<boolean>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (options.roles.includes(user.role)) {
      return next();
    }

    const paramName = options.paramName ?? "userId";
    const paramValue = req.params[paramName];
    if (options.allowSelf && paramValue) {
      const isOwner = await ownerCheck(user.id, paramValue);
      if (isOwner) return next();
    }

    return res.status(403).json({ error: "Insufficient role permissions" });
  };
}

/**
 * Check if user has a specific role.
 */
export function hasRole(user: any, ...roles: UserRole[]): boolean {
  return user && roles.includes(user.role);
}

/**
 * Check if user owns a resource (userId matches).
 */
export function isOwner(user: any, resourceUserId: number): boolean {
  return user && user.id === resourceUserId;
}
