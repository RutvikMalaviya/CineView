import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../errors/app-error";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Insufficient permissions", HTTP_STATUS.FORBIDDEN, "FORBIDDEN"));
      return;
    }

    next();
  };
}
