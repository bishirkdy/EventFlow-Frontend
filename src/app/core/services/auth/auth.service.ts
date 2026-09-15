import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Api } from '../api';
import { ApiResponse } from '../../models/api-response';
import { UserProfile } from '../../models/user-profile';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(Api);

  // Global current user
  currentUser = signal<UserProfile | null>(null);

  login(data: LoginRequest): Observable<any> {
    return this.http.post(this.api.getUrl('/v1/auth/login'), data, { withCredentials: true });
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(this.api.getUrl('/v1/auth/register'), request, { withCredentials: true })
  }

  logout(): Observable<any> {
    return this.http.post(this.api.getUrl("/v1/auth/logout"), {})
  }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(
      `${this.api.getUrl('/v1/auth/profile')}`,
      {
        withCredentials: true,
      }
    );
  }

  loadCurrentUser(): Observable<UserProfile | null> {
    return this.getProfile().pipe(
      tap((response) => {
        this.currentUser.set(response.data);
      }),
      map((response) => response.data),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }
}
