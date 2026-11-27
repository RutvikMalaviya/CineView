import argon2 from "argon2";
import request from "supertest";
import { createApp } from "../../../app";
import { EmailVerificationModel } from "../auth-token.model";
import { UserModel } from "../../users";

jest.mock("../../users", () => {
  const actual = jest.requireActual("../../users");
  return {
    ...actual,
    findActiveUserByEmail: jest.fn(),
    findActiveUserById: jest.fn(),
    createUserRecord: jest.fn(),
    markUserEmailVerified: jest.fn(),
  };
});

jest.mock("../auth-token.model", () => ({
  EmailVerificationModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  PasswordResetModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

const mockedUsers = jest.requireMock("../../users") as {
  findActiveUserByEmail: jest.Mock;
  findActiveUserById: jest.Mock;
  createUserRecord: jest.Mock;
  markUserEmailVerified: jest.Mock;
};

describe("Auth Feature", () => {
  const app = createApp();

  async function getCsrfAgent() {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/api/v1/csrf-token");
    return { agent, csrfToken: csrfRes.body.data.csrfToken as string };
  }

  it("registers a new customer with CSRF token and sets session cookie", async () => {
    const { agent, csrfToken } = await getCsrfAgent();

    mockedUsers.findActiveUserByEmail.mockResolvedValueOnce(null);
    mockedUsers.createUserRecord.mockResolvedValueOnce({
      get: () => ({
        id: "usr-123",
        name: "Jane Doe",
        email: "jane@cineview.app",
        passwordHash: "hashed",
        role: "CUSTOMER",
        isActive: true,
        emailVerified: false,
        tier: "Cinephile • Member",
        points: 0,
        preferredFormat: "IMAX with Laser",
        preferredRowZone: "center",
        accessibilityNeeds: false,
        savedCinemaIds: [],
        notifications: { showtimeAlerts: true, premiereInvites: true, smsTicketUpdates: false },
        createdAt: 1700000000,
        createdBy: "self-registration",
        isDeleted: false,
      }),
    });
    (EmailVerificationModel.create as jest.Mock).mockResolvedValueOnce({});

    const res = await agent
      .post("/api/v1/auth/register")
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Jane Doe",
        email: "jane@cineview.app",
        password: "StrongPassword123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("jane@cineview.app");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.verificationToken).toBeDefined();
  });

  it("logs in an existing customer and accesses /auth/me", async () => {
    const { agent, csrfToken } = await getCsrfAgent();
    const passwordHash = await argon2.hash("StrongPassword123!", { type: argon2.argon2id });

    const userPlain = {
      id: "usr-123",
      name: "Jane Doe",
      email: "jane@cineview.app",
      passwordHash,
      role: "CUSTOMER",
      isActive: true,
      emailVerified: true,
      tier: "Cinephile • Member",
      points: 100,
      preferredFormat: "IMAX with Laser",
      preferredRowZone: "center",
      accessibilityNeeds: false,
      savedCinemaIds: [],
      notifications: { showtimeAlerts: true, premiereInvites: true, smsTicketUpdates: false },
      createdAt: 1700000000,
      createdBy: "self-registration",
      isDeleted: false,
    };

    mockedUsers.findActiveUserByEmail.mockResolvedValueOnce({
      ...userPlain,
      get: () => userPlain,
    });
    mockedUsers.findActiveUserById.mockResolvedValueOnce({
      ...userPlain,
      get: () => userPlain,
    });

    const loginRes = await agent
      .post("/api/v1/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ email: "jane@cineview.app", password: "StrongPassword123!" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.email).toBe("jane@cineview.app");

    const meRes = await agent.get("/api/v1/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.id).toBe("usr-123");
  });

  it("rejects /auth/me when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid login credentials with 401", async () => {
    const { agent, csrfToken } = await getCsrfAgent();
    mockedUsers.findActiveUserByEmail.mockResolvedValueOnce(null);

    const res = await agent
      .post("/api/v1/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ email: "nobody@cineview.app", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });
});

// Keep UserModel import referenced for typecheck if needed
void UserModel;
