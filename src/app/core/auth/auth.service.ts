import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthState, AuthResponse, ApiResponse, LoginCredentials,
  RegisterRequest, ChangePasswordRequest, CompleteRegistrationRequest,
  ForgotPasswordRequest, ResetPasswordRequest, UserDTO
} from './auth.types';

const AUTH_STORAGE_KEY = 'auth_state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthState | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const authState: AuthState = JSON.parse(stored);
        this.currentUserSubject.next(authState);
        this.isAuthenticatedSubject.next(true);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  private normalizeRoles(roles: string[]): string[] {
    return roles.map(r => r.replace(/^ROLE_/i, '').toUpperCase());
  }

  login(credentials: LoginCredentials): Observable<AuthState> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        const auth = response.data;
        const authState: AuthState = {
          ...auth,
          roles: this.normalizeRoles(auth.roles)
        };
        this.setAuth(authState);
        return authState;
      }),
      catchError(err => {
        const message = err?.error?.message || err?.message || 'Login failed';
        return throwError(() => new Error(message));
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthState> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/register', request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Registration failed');
        }
        const auth = response.data;
        const authState: AuthState = {
          ...auth,
          roles: this.normalizeRoles(auth.roles)
        };
        this.setAuth(authState);
        return authState;
      }),
      catchError(err => {
        const message = err?.error?.message || err?.message || 'Registration failed';
        return throwError(() => new Error(message));
      })
    );
  }

  refreshToken(): Observable<AuthState> {
    const current = this.currentUserSubject.value;
    if (!current?.refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {
      refreshToken: current.refreshToken
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Token refresh failed');
        }
        const auth = response.data;
        const authState: AuthState = {
          ...auth,
          roles: this.normalizeRoles(auth.roles)
        };
        this.setAuth(authState);
        return authState;
      }),
      catchError(err => {
        this.clearAuth();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const current = this.currentUserSubject.value;
    if (current?.refreshToken) {
      this.http.post('/api/auth/logout', { refreshToken: current.refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<ApiResponse<void>>('/api/auth/change-password', request).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Password change failed');
        }
        const current = this.currentUserSubject.value;
        if (current) {
          const updated = { ...current, passwordChangeRequired: false };
          this.setAuth(updated);
        }
        return response;
      }),
      catchError(err => {
        const message = err?.error?.message || err?.message || 'Password change failed';
        return throwError(() => new Error(message));
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<ApiResponse<void>>('/api/auth/forgot-password', { email });
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post<ApiResponse<void>>('/api/auth/reset-password', request);
  }

  completeRegistration(request: CompleteRegistrationRequest): Observable<AuthState> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/complete-registration', request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Registration completion failed');
        }
        const auth = response.data;
        const authState: AuthState = {
          ...auth,
          roles: this.normalizeRoles(auth.roles)
        };
        this.setAuth(authState);
        return authState;
      })
    );
  }

  getCurrentUser(): AuthState | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.currentUserSubject.value?.accessToken || null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.roles.includes('ADMIN') || user.roles.includes('SUPERUSER');
  }

  isSuperUser(): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes('SUPERUSER') || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role.toUpperCase()) || false;
  }

  private setAuth(authState: AuthState): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    this.currentUserSubject.next(authState);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
