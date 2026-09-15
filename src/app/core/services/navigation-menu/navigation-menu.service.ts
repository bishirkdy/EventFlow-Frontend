import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response';
import { CreateNavigationMenuRequest, NavigationMenuModel, UpdateNavigationMenuRequest } from '../../models/navigation-menu/navigation-menu.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationMenuService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getNavigationMenus(eventId: string): Observable<ApiResponse<NavigationMenuModel[]>> {
    return this.http.get<ApiResponse<NavigationMenuModel[]>>(
      this.api.getUrl(
        `api/v1/navigation-menu/${eventId}/navigation-menus`
      ),
      {
        withCredentials: true,
      }
    );
  }

  // GET by ID
  getNavigationMenuById(eventId: string, menuId: string): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.get<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(
        `api/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`
      ),
      { withCredentials: true }
    );
  }

  // CREATE
  createNavigationMenu(eventId: string, request: CreateNavigationMenuRequest): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.post<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(`api/v1/navigation-menu/${eventId}/navigation-menus`),
      request,
      { withCredentials: true }
    );
  }

  // UPDATE
  updateNavigationMenu(eventId: string, menuId: string, request: UpdateNavigationMenuRequest): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.put<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(`api/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`),
      request,
      { withCredentials: true }
    );
  }

  // DELETE
  deleteNavigationMenu(eventId: string, menuId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(`api/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`),
      { withCredentials: true }
    );
  }
}
