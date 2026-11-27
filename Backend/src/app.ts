import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import i18n from "./config/i18n";
import { apiRouter } from "./features";
import { HTTP_STATUS } from "./shared/constants/http-status";
import { csrfProtectionMiddleware, issueCsrfToken } from "./shared/middlewares/csrf.middleware";
import { errorMiddleware, notFoundMiddleware } from "./shared/middlewares/error.middleware";
import { globalRateLimiter } from "./shared/middlewares/rate-limit.middleware";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { createSessionMiddleware } from "./shared/middlewares/session.middleware";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(requestIdMiddleware);
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-Id"],
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());
  app.use(i18n.init);
  app.use(createSessionMiddleware());
  app.use(globalRateLimiter);

  app.get(`${env.API_PREFIX}/csrf-token`, (req, res) => {
    const csrfToken = issueCsrfToken(req, res);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: res.__("responses.success"),
      data: { csrfToken },
    });
  });

  app.use(env.API_PREFIX, csrfProtectionMiddleware, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
