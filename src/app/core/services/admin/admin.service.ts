import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { ApiResponse, PaginatedResponseModel } from '../../models/common';
import {
  AdminEventListItem,
  AdminEventStats,
  AdminUserListItem,
  AdminUserStats,
} from '../../models/admin';
import { ADMIN_ENDPOINTS } from '../../api/endpoints/admin-endpoints/admin-endpoints';

export interface AdminEventsQuery {
  page?: number;
  pageSize?: number;
  status?: string | null;
  search?: string | null;
}

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getEvents(query: AdminEventsQuery = {}): Observable<ApiResponse<PaginatedResponseModel<AdminEventListItem>>> {
    return this.http.get<ApiResponse<PaginatedResponseModel<AdminEventListItem>>>(
      this.api.getUrl(ADMIN_ENDPOINTS.events),
      { params: this.buildParams(query) },
    );
  }

  getEventStats(): Observable<ApiResponse<AdminEventStats>> {
    return this.http.get<ApiResponse<AdminEventStats>>(
      this.api.getUrl(ADMIN_ENDPOINTS.eventStats),
    );
  }

  getUsers(query: AdminUsersQuery = {}): Observable<ApiResponse<PaginatedResponseModel<AdminUserListItem>>> {
    return this.http.get<ApiResponse<PaginatedResponseModel<AdminUserListItem>>>(
      this.api.getUrl(ADMIN_ENDPOINTS.users),
      { params: this.buildParams(query) },
    );
  }

  getUserStats(): Observable<ApiResponse<AdminUserStats>> {
    return this.http.get<ApiResponse<AdminUserStats>>(
      this.api.getUrl(ADMIN_ENDPOINTS.userStats),
    );
  }

  private buildParams(query: AdminEventsQuery & AdminUsersQuery): HttpParams {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.status) params = params.set('status', query.status);
    if (query.search?.trim()) params = params.set('search', query.search.trim());

    return params;
  }
}
