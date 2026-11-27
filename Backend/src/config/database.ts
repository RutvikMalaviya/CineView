import { Sequelize } from "sequelize";
import { env } from "./env";
import { logger } from "./logger";

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "postgres",
  logging: env.NODE_ENV === "development" ? (sql) => logger.debug({ sql }, "sequelize") : false,
  dialectOptions: env.DB_SSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: true,
        },
      }
    : undefined,
  pool: {
    max: 15,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});
