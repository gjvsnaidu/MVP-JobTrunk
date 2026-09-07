import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Drizzle/MySQL errors
  if ((err as any).code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  if ((err as any).code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Referenced resource not found" });
  }

  return res.status(500).json({ error: "Internal server error" });
}
