import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.post(this.api.getUrl('/auth/v1/login'), data, { withCredentials: true });
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(this.api.getUrl('/auth/v1/register'), request, { withCredentials: true })
  }

  logout(): Observable<any> {
    return this.http.post(this.api.getUrl("/auth/logout"), {})
  }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(
      `${this.api.getUrl('/auth/v1/profile')}`,
      {
        withCredentials: true,
      }
    );
  }

  loadCurrentUser(): void {
    this.getProfile().subscribe({
      next: (response) => {
        this.currentUser.set(response.data);
      },
      error: () => {
        this.currentUser.set(null);
      },
    });
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }
}
