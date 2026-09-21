import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { ApiResponse } from '../../models/common/api-response';
import { NavigationMenuModel } from '../../models/navigation-menu/navigation-menu.model';
import { NAVIGATION_MENU_ENDPOINTS } from '../../api/endpoints/navigation-menu.endpoint';
import { CreateNavigationMenuRequest } from '../../models/navigation-menu/create-navigation-menu';
import { UpdateNavigationMenuModel } from '../../models/navigation-menu/update-navigation.menu';

@Injectable({
  providedIn: 'root',
})
export class NavigationMenuService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getMenus(eventId: string): Observable<ApiResponse<NavigationMenuModel[]>> {
    return this.http.get<ApiResponse<NavigationMenuModel[]>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.getMenus(eventId)),
    );
  }

  createMenu(eventId: string, request: CreateNavigationMenuRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.createMenu(eventId)),
      request,
    );
  }

  getMenuById(eventId: string, menuId: string): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.get<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.getMenuById(eventId, menuId)),
    );
  }

  updateMenu(eventId: string, menuId: string, request: UpdateNavigationMenuModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.updateMenu(eventId, menuId)),
      request,
    );
  }

  deleteMenu(eventId: string, menuId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.deleteMenu(eventId, menuId)),
    );
  }
}
