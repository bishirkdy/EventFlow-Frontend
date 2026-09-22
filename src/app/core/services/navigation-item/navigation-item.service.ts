import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { NavigationItemModel } from '../../models/navigation-item/navigation-item.model';
import { ApiResponse } from '../../models/common/api-response';
import { NAVIGATION_ITEM_ENDPOINTS } from '../../api/endpoints/navigation-item.endpoint';
import { CreateNavigationItemModel } from '../../models/navigation-item/create-navigation-item';
import { UpdateNavigationItemModel } from '../../models/navigation-item/update-navigation-item';
import { NavigationItemByPageModel } from '../../models/navigation-item/navigation-item-bypage.model';

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

  createItem(
    navigationMenuId: string,
    request: CreateNavigationItemModel,
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.createItem(navigationMenuId)),
      request,
    );
  }

  updateItem(
    navigationMenuId: string,
    itemId: string,
    request: UpdateNavigationItemModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.updateItem(navigationMenuId, itemId)),
      request,
    );
  }

  deleteItem(navigationMenuId: string, itemId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.deleteItem(navigationMenuId, itemId)),
    );
  }

  reorderItems(
    navigationMenuId: string,
    itemIds: string[],
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.reorderItems(navigationMenuId)),
      itemIds,
    );
  }

  setVisibility(
    navigationMenuId: string,
    itemId: string,
    isVisible: boolean,
  ): Observable<ApiResponse<object | null>> {
    return this.http.patch<ApiResponse<object | null>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.setVisibility(navigationMenuId, itemId)),
      isVisible,
    );
  }

  getItemByPage(pageId: string): Observable<ApiResponse<NavigationItemByPageModel | null>> {
    return this.http.get<ApiResponse<NavigationItemByPageModel | null>>(
      this.api.getUrl(NAVIGATION_ITEM_ENDPOINTS.getItemByPage(pageId)),
    );
  }
}
