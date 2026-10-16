export type UserRole = "admin" | "manager" | "driver" | "customer";

export interface AuthUser {
  id?: string;
  _id?: string;
  sub?: string;
  role: UserRole;
  organizationId?: string;
  orgId?: string;
}

export function getUserId(user: AuthUser): string {
  const id = user.id ?? user._id ?? user.sub;

  if (!id) {
    throw new Error("Authenticated token does not contain a user ID.");
  }

  return String(id);
}

export function getOrganizationId(user: AuthUser): string {
  const id = user.organizationId ?? user.orgId;

  if (!id) {
    throw new Error("Authenticated token does not contain an organization ID.");
  }

  return String(id);
}
