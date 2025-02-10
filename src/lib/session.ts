import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function checkRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role);
}
