import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { CreateNavigationItemRequest, NavigationItemModel, ReorderNavigationItemsRequest, UpdateNavigationItemRequest, UpdateNavigationItemVisibilityRequest } from '../../models/navigation-item/navigation-item.model';

@Injectable({
  providedIn: 'root',
})
export class NavigationItemService {
  private http = inject(HttpClient);
  private api = inject(Api);

  // GET
  getItems(
    navigationMenuId: string
  ): Observable<ApiResponse<NavigationItemModel[]>> {
    return this.http.get<ApiResponse<NavigationItemModel[]>>(
      this.api.getUrl(`api/v1/navigation-items/${navigationMenuId}/items`),
      { withCredentials: true }
    );
  }

  // GET by ID
  getItemById(
    navigationMenuId: string,
    itemId: string
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.get<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(`api/v1/navigation-items/${navigationMenuId}/items/${itemId}`),
      { withCredentials: true }
    );
  }

  // CREATE
  createItem(
    navigationMenuId: string,
    request: CreateNavigationItemRequest
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.post<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(`api/v1/navigation-items/${navigationMenuId}/items`),
      request,
      { withCredentials: true }
    );
  }

  // UPDATE
  updateItem(
    navigationMenuId: string,
    itemId: string,
    request: UpdateNavigationItemRequest
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.put<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(`api/v1/navigation-items/${navigationMenuId}/items/${itemId}`),
      request,
      { withCredentials: true }
    );
  }

  // DELETE
  deleteItem(navigationMenuId: string, itemId: string
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(
        `api/v1/navigation-items/${navigationMenuId}/items/${itemId}`
      ),
      { withCredentials: true }
    );
  }

  // REORDER
  reorderItems(navigationMenuId: string, request: ReorderNavigationItemsRequest
  ): Observable<ApiResponse<NavigationItemModel[]>> {
    return this.http.put<ApiResponse<NavigationItemModel[]>>(
      this.api.getUrl(
        `api/v1/navigation-items/${navigationMenuId}/items/reorder`
      ),
      request,
      { withCredentials: true }
    );
  }

  // VISIBILITY
  updateVisibility(navigationMenuId: string, itemId: string, request: UpdateNavigationItemVisibilityRequest
  ): Observable<ApiResponse<NavigationItemModel>> {
    return this.http.patch<ApiResponse<NavigationItemModel>>(
      this.api.getUrl(
        `api/v1/navigation-items/${navigationMenuId}/items/${itemId}/visibility`
      ),
      request,
      { withCredentials: true }
    );
  }
}
