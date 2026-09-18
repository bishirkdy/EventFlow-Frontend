import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { NAVIGATION_MENU_ENDPOINTS } from '../../api/endpoints/navigation-menu.endpoint';

import { ApiResponse } from '../../models/common/api-response';
import { NavigationMenuModel } from '../../models/navigation-menu/navigation-menu.model';
import { CreateNavigationMenuRequest } from '../../models/navigation-menu/create-navigation-menu';
import { UpdateNavigationMenuRequest } from '../../models/navigation-menu/update-navigation.menu';


@Injectable({
  providedIn: 'root',
})
export class NavigationMenuService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getNavigationMenus(eventId: string): Observable<ApiResponse<NavigationMenuModel[]>> {
    return this.http.get<ApiResponse<NavigationMenuModel[]>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.getMenus(eventId)),
    );
  }

  getNavigationMenuById(
    eventId: string,
    menuId: string,
  ): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.get<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.getMenuById(eventId, menuId)),
    );
  }

  createNavigationMenu(
    eventId: string,
    request: CreateNavigationMenuRequest,
  ): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.post<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.createMenu(eventId)),
      request,
    );
  }

  updateNavigationMenu(
    eventId: string,
    menuId: string,
    request: UpdateNavigationMenuRequest,
  ): Observable<ApiResponse<NavigationMenuModel>> {
    return this.http.put<ApiResponse<NavigationMenuModel>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.updateMenu(eventId, menuId)),
      request,
    );
  }

  deleteNavigationMenu(eventId: string, menuId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(NAVIGATION_MENU_ENDPOINTS.deleteMenu(eventId, menuId)),
    );
  }
}
