export const ROLES = {
  CUSTOMER: "CUSTOMER",
  CINEMA_ADMIN: "CINEMA_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
