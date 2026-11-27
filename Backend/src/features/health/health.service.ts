import { sequelize } from "../../config/database";
import { redis } from "../../config/redis";

export interface HealthReport {
  status: "ok" | "degraded";
  uptimeSeconds: number;
  timestamp: string;
  services: {
    database: "up" | "down" | "skipped";
    redis: "up" | "down" | "skipped";
  };
}

export async function getHealthStatus(checkDependencies = false): Promise<HealthReport> {
  let dbStatus: "up" | "down" | "skipped" = "skipped";
  let redisStatus: "up" | "down" | "skipped" = "skipped";

  if (checkDependencies) {
    try {
      await sequelize.authenticate();
      dbStatus = "up";
    } catch {
      dbStatus = "down";
    }

    try {
      const pong = await redis.ping();
      redisStatus = pong === "PONG" ? "up" : "down";
    } catch {
      redisStatus = "down";
    }
  }

  const degraded = dbStatus === "down" || redisStatus === "down";

  return {
    status: degraded ? "degraded" : "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  };
}
