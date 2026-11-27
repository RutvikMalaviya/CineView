require("dotenv").config();

const common = {
  username: process.env.DB_USER || "cineview",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  dialect: "postgres",
};

module.exports = {
  development: {
    ...common,
    database: process.env.DB_NAME || "cineview_dev",
  },
  test: {
    ...common,
    database: process.env.DB_NAME || "cineview_test",
  },
  production: {
    ...common,
    database: process.env.DB_NAME || "cineview_prod",
    dialectOptions:
      process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: true } }
        : undefined,
  },
};
