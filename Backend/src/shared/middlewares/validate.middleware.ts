import type { NextFunction, Request, Response } from "express";
import { ZodError, type AnyZodObject } from "zod";
import { HTTP_STATUS } from "../constants/http-status";

export function validateRequest(schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Request["query"];
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message:
            typeof res.__ === "function"
              ? res.__("responses.validation_error")
              : "Validation failed",
          code: "VALIDATION_ERROR",
          errors: error.errors.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
