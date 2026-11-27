import { createApp } from "./app";
import { sequelize } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { redis } from "./config/redis";
import { startReservationExpiryJob } from "./jobs/reservation-expiry.job";

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connection established");

    if (redis.status === "wait") {
      await redis.connect();
    }
    await redis.ping();
    logger.info("Redis connection established");

    const expiryTimer = startReservationExpiryJob();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, "CineView Backend listening");
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");
      clearInterval(expiryTimer);
      server.close(async () => {
        await sequelize.close();
        await redis.quit();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start CineView Backend");
    process.exit(1);
  }
}

void bootstrap();
