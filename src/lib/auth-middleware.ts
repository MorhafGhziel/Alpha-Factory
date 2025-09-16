import { getServerSession } from "./get-session";
import { redirect } from "next/navigation";

export type UserRole =
  | "owner"
  | "admin"
  | "client"
  | "designer"
  | "reviewer"
  | "editor";

interface AuthMiddlewareOptions {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Middleware to check authentication and role-based access
 * @param options - Configuration for the middleware
 * @returns User session if authorized
 */
export async function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const { requiredRole, allowedRoles, redirectTo = "/" } = options;

  const session = await getServerSession();
  const user = session?.user;

  // Check if user is authenticated
  if (!user) {
    redirect(redirectTo);
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    redirect(redirectTo);
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role as UserRole)
  ) {
    redirect(redirectTo);
  }

  return { user, session };
}

/**
 * Utility functions for specific role checks
 */
export const requireOwner = () => authMiddleware({ requiredRole: "owner" });
export const requireAdmin = () => authMiddleware({ requiredRole: "admin" });
export const requireClient = () => authMiddleware({ requiredRole: "client" });
export const requireDesigner = () =>
  authMiddleware({ requiredRole: "designer" });
export const requireReviewer = () =>
  authMiddleware({ requiredRole: "reviewer" });
export const requireEditor = () => authMiddleware({ requiredRole: "editor" });

/**
 * Check if user has any of the specified roles
 */
export const requireAnyRole = (roles: UserRole[]) =>
  authMiddleware({ allowedRoles: roles });

/**
 * Check if user is admin or owner (for current admin routes)
 */
export const requireAdminOrOwner = () =>
  authMiddleware({ allowedRoles: ["admin", "owner"] });

/**
 * Check if user is only owner (for admin panel routes)
 */
export const requireOwnerOnly = () => authMiddleware({ requiredRole: "owner" });

/**
 * Get user role-specific dashboard path
 */
export function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "owner":
      return "/admin";
    case "admin":
      return "/admin";
    case "client":
      return "/client";
    case "designer":
      return "/designer";
    case "reviewer":
      return "/reviewer";
    case "editor":
      return "/editor";
    default:
      return "/";
  }
}
