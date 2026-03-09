import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, UserDTO } from '../core/auth/auth.types';

export interface AdminCreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  username?: string;
}

export interface CreateUserResponse {
  user: UserDTO;
  welcomeEmailSent: boolean;
  defaultPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<ApiResponse<UserDTO[]>>('/api/users').pipe(map(res => res.data));
  }

  getUserById(id: number): Observable<UserDTO> {
    return this.http.get<ApiResponse<UserDTO>>(`/api/users/${id}`).pipe(map(res => res.data));
  }

  createUser(request: AdminCreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<ApiResponse<CreateUserResponse>>('/api/users', request).pipe(map(res => res.data));
  }

  updateUser(id: number, dto: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.put<ApiResponse<UserDTO>>(`/api/users/${id}`, dto).pipe(map(res => res.data));
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`/api/users/${id}`).pipe(map(res => res.data));
  }

  assignRole(userId: number, roleName: string): Observable<UserDTO> {
    return this.http.post<ApiResponse<UserDTO>>(`/api/users/${userId}/roles/${roleName}`, {}).pipe(map(res => res.data));
  }

  removeRole(userId: number, roleName: string): Observable<UserDTO> {
    return this.http.delete<ApiResponse<UserDTO>>(`/api/users/${userId}/roles/${roleName}`).pipe(map(res => res.data));
  }

  unlockUser(id: number): Observable<UserDTO> {
    return this.http.post<ApiResponse<UserDTO>>(`/api/users/${id}/unlock`, {}).pipe(map(res => res.data));
  }

  forcePassword(id: number, password: string): Observable<void> {
    return this.http.put<ApiResponse<void>>(`/api/users/${id}/force-password`, { password }).pipe(map(res => res.data));
  }

  forceLogout(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`/api/users/${id}/force-logout`, {}).pipe(map(res => res.data));
  }

  getAvailableRoles(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>('/api/users/roles').pipe(map(res => res.data));
  }
}
