/**
 * User roles for RBAC
 */
export enum UserRole {
  CLIENT = 'client',
  STAFF = 'staff',
  MANAGER = 'manager',
  OWNER = 'owner',
  ADMIN = 'admin',
}

/**
 * User entity (matches Prisma model)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth response with tokens
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token pair for refresh
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
