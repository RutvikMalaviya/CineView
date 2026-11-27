import argon2 from "argon2";
import crypto from "crypto";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import {
  createUserRecord,
  findActiveUserByEmail,
  findActiveUserById,
  markUserEmailVerified,
  toPublicUser,
  updateUserPasswordHash,
  type PublicUser,
} from "../users";
import { EmailVerificationModel, PasswordResetModel } from "./auth-token.model";
import type { LoginInput, RegisterInput } from "./auth.validator";

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function registerCustomer(input: RegisterInput): Promise<{
  user: PublicUser;
  verificationToken: string;
}> {
  const existing = await findActiveUserByEmail(input.email);
  if (existing) {
    throw new AppError(
      "An account with this email already exists",
      HTTP_STATUS.CONFLICT,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const user = await createUserRecord({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone,
    city: input.city,
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  await EmailVerificationModel.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: now + 86400,
    createdAt: now,
    createdBy: user.id,
  });

  return {
    user: toPublicUser(user),
    verificationToken: rawToken,
  };
}

export async function authenticateUser(input: LoginInput): Promise<PublicUser> {
  const user = await findActiveUserByEmail(input.email);
  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }

  return toPublicUser(user);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await findActiveUserById(userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }
  return toPublicUser(user);
}

export async function verifyEmailToken(rawToken: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const record = await EmailVerificationModel.findOne({
    where: {
      tokenHash: hashToken(rawToken),
      isDeleted: false,
      usedAt: null,
    },
  });

  if (!record || record.expiresAt < now) {
    throw new AppError("Invalid or expired verification token", HTTP_STATUS.BAD_REQUEST, "INVALID_TOKEN");
  }

  await record.update({ usedAt: now, updatedAt: now, updatedBy: record.userId });
  await markUserEmailVerified(record.userId);
}

export async function requestPasswordReset(email: string): Promise<{ resetToken?: string }> {
  const user = await findActiveUserByEmail(email);
  if (!user || !user.isActive) {
    // Do not reveal whether the email exists
    return {};
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  await PasswordResetModel.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: now + 3600,
    createdAt: now,
    createdBy: user.id,
  });

  return { resetToken: rawToken };
}

export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const record = await PasswordResetModel.findOne({
    where: {
      tokenHash: hashToken(rawToken),
      isDeleted: false,
      usedAt: null,
    },
  });

  if (!record || record.expiresAt < now) {
    throw new AppError("Invalid or expired reset token", HTTP_STATUS.BAD_REQUEST, "INVALID_TOKEN");
  }

  const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await record.update({ usedAt: now, updatedAt: now, updatedBy: record.userId });
  await updateUserPasswordHash(record.userId, passwordHash);
}
