import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Api } from '../../api/api';
import { ApiResponse } from '../../models/common/api-response';
import { UserProfile } from '../../models/common/user-profile';
import { LoginRequest } from '../../models/auth/login/LoginRequest';
import { RegisterRequest } from '../../models/auth/register/RegisterRequest';
import { AUTH_ENDPOINTS } from '../../api/endpoints/auth-endpoints';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  readonly currentUser = signal<UserProfile | null>(null);

  login(data: LoginRequest): Observable<UserProfile | null> {
    return this.http
      .post<ApiResponse<unknown>>(this.api.getUrl(AUTH_ENDPOINTS.login), data)
      .pipe(switchMap(() => this.loadCurrentUser()));
  }

  register(request: RegisterRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.api.getUrl(AUTH_ENDPOINTS.register), request);
  }

  logout(): Observable<ApiResponse<unknown>> {
    return this.http
      .post<ApiResponse<unknown>>(this.api.getUrl(AUTH_ENDPOINTS.logout), {})
      .pipe(tap(() => this.clearCurrentUser()));
  }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(this.api.getUrl(AUTH_ENDPOINTS.profile));
  }

  loadCurrentUser(): Observable<UserProfile | null> {
    return this.getProfile().pipe(
      tap((response) => {
        this.currentUser.set(response.data);
      }),
      map((response) => response.data),
      catchError(() => {
        this.clearCurrentUser();
        return of(null);
      }),
    );
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }
}
