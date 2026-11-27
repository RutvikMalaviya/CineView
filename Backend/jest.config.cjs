/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ["<rootDir>/src/config/test-env.ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/__tests__/**",
    "!src/server.ts",
    "!src/db/migrations/**",
    "!src/db/seeders/**",
  ],
};
