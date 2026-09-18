import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { NAVIGATION_ITEM_ENDPOINTS } from '../../api/endpoints/navigation-item.endpoint';

import { ApiResponse } from '../../models/common/api-response';
import { NavigationItemModel } from '../../models/navigation-item/navigation-item.model';
import { CreateNavigationItemRequest } from '../../models/navigation-item/create-navigation-item';
import { UpdateNavigationItemRequest } from '../../models/navigation-item/update-navigation-item';
import { ReorderNavigationItemsRequest } from '../../models/navigation-item/recorder-navigation-items-request';
import { UpdateNavigationItemVisibilityRequest } from '../../models/navigation-item/update-navigation-item-visibility-request';

@Injectable({
  providedIn: 'root',
})
export class NavigationItemService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getItems(navigationMenuId: string): Observable<ApiResponse<NavigationItemModel[]>> {
    return this.http.get<ApiResponse<NavigationItemModel[]>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.getItems(navigationMenuId)),
    );
  }

  getItemById(
    navigationMenuId: string,
    itemId: string,
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.get<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.getItemById(navigationMenuId, itemId)),
    );
  }

  createItem(
    navigationMenuId: string,
    request: CreateNavigationItemRequest,
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.post<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.createItem(navigationMenuId)),
      request,
    );
  }

  updateItem(
    navigationMenuId: string,
    itemId: string,
    request: UpdateNavigationItemRequest,
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.put<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.updateItem(navigationMenuId, itemId)),
      request,
    );
  }

  deleteItem(navigationMenuId: string, itemId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.deleteItem(navigationMenuId, itemId)),
    );
  }

  reorderItems(
    navigationMenuId: string,
    request: ReorderNavigationItemsRequest,
  ): Observable<ApiResponse<NavigationItemModel[]>> {
    return this.http.put<ApiResponse<NavigationItemModel[]>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.reorderItems(navigationMenuId)),
      request,
    );
  }

  updateVisibility(
    navigationMenuId: string,
    itemId: string,
    request: UpdateNavigationItemVisibilityRequest,
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.patch<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.updateVisibility(navigationMenuId, itemId)),
      request,
    );
  }
}
