import request from "supertest";
import { createApp } from "../../../app";

describe("Health Feature & Security Headers", () => {
  const app = createApp();

  it("GET /api/v1/health returns 200 with healthy status and security headers", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("GET /api/v1/csrf-token issues a signed CSRF cookie and token", async () => {
    const res = await request(app).get("/api/v1/csrf-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.csrfToken).toBe("string");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST to protected/state-changing route without CSRF token is rejected with 403", async () => {
    const res = await request(app).post("/api/v1/health").send({});

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("CSRF_INVALID");
  });

  it("GET unknown route returns 404 with standard error envelope", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
