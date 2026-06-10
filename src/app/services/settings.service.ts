import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../core/auth/auth.types';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  getCapacity(): Observable<number> {
    return this.http.get<ApiResponse<{ capacity: number }>>('/api/settings/public/retreat-capacity').pipe(
      map(r => r.data.capacity)
    );
  }

  setCapacity(capacity: number): Observable<number> {
    return this.http.put<ApiResponse<{ capacity: number }>>('/api/settings/retreat-capacity', { capacity }).pipe(
      map(r => r.data.capacity)
    );
  }
}
