export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  passwordChangeRequired: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  passwordChangeRequired: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  isLocked: boolean;
  lastLogin: string;
  createdAt: string;
  passwordChangeRequired: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export enum Role {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface CompleteRegistrationRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
