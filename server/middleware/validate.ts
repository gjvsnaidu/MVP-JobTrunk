import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidationTarget = "body" | "query" | "params";

/**
 * Create a middleware that validates request data against a Zod schema.
 */
export function validate(schema: z.ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // Replace with parsed (coerced/defaulted) values
    (req as any)[target] = result.data;
    next();
  };
}

/**
 * Validate body + params + query in one middleware.
 */
export function validateAll(schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map((e: any) => ({ field: `body.${e.path.join(".")}`, message: e.message })));
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map((e: any) => ({ field: `query.${e.path.join(".")}`, message: e.message })));
      } else {
        (req as any).query = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map((e: any) => ({ field: `params.${e.path.join(".")}`, message: e.message })));
      } else {
        req.params = result.data as any;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    next();
  };
}

// =============================================================================
// Common Zod Schemas
// =============================================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});
