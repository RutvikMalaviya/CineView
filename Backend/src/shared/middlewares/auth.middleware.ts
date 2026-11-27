import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../errors/app-error";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: Role;
    email?: string;
    name?: string;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.userId || !req.session?.role) {
    next(new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED"));
    return;
  }

  req.user = {
    id: req.session.userId,
    email: req.session.email ?? "",
    name: req.session.name ?? "",
    role: req.session.role,
  };

  next();
}
