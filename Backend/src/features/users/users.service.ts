import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ROLES, type Role } from "../../shared/constants/roles";
import { AppError } from "../../shared/errors/app-error";
import { UserModel, type UserAttributes, type UserInstance } from "./user.model";
import type { UpdateProfileInput } from "./users.validator";

export type PublicUser = Omit<
  UserAttributes,
  "passwordHash" | "deletedAt" | "deletedBy" | "isDeleted"
>;

export function toPublicUser(user: UserInstance): PublicUser {
  const plain = user.get({ plain: true });
  const { passwordHash: _pw, deletedAt: _da, deletedBy: _db, isDeleted: _id, ...safe } = plain;
  return safe;
}

export async function findActiveUserByEmail(email: string): Promise<UserInstance | null> {
  return UserModel.findOne({
    where: {
      email: email.toLowerCase(),
      isDeleted: false,
    },
  });
}

export async function findActiveUserById(id: string): Promise<UserInstance | null> {
  return UserModel.findOne({
    where: {
      id,
      isDeleted: false,
    },
  });
}

export async function createUserRecord(input: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  city?: string;
  role?: Role;
}): Promise<UserInstance> {
  const now = Math.floor(Date.now() / 1000);
  return UserModel.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    phone: input.phone ?? null,
    city: input.city ?? "Los Angeles",
    role: input.role ?? ROLES.CUSTOMER,
    createdAt: now,
    createdBy: "self-registration",
  });
}

export async function getUserProfile(userId: string): Promise<PublicUser> {
  const user = await findActiveUserById(userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
  }
  return toPublicUser(user);
}

export async function updateUserProfile(
  userId: string,
  patch: UpdateProfileInput,
): Promise<PublicUser> {
  const user = await findActiveUserById(userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
  }

  await user.update({
    ...patch,
    updatedAt: Math.floor(Date.now() / 1000),
    updatedBy: userId,
  });

  return toPublicUser(user);
}

export async function markUserEmailVerified(userId: string): Promise<void> {
  await UserModel.update(
    {
      emailVerified: true,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: userId,
    },
    { where: { id: userId, isDeleted: false } },
  );
}

export async function updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
  await UserModel.update(
    {
      passwordHash,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: userId,
    },
    { where: { id: userId, isDeleted: false } },
  );
}
