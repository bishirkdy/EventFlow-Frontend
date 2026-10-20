import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/common';
import { environment } from '../../../../environments/environment';
import { PHOTO_ENDPOINTS } from '@/core/api/endpoints/photo-endpoint/photo.endpoint';
import { Photo, UploadedPhoto } from '@/core/models/photographer';
import { PaginatedResponseModel } from '@/core/models/common';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  uploadPhoto(eventId: string, file: File): Observable<ApiResponse<UploadedPhoto>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ApiResponse<UploadedPhoto>>(
      `${this.apiUrl}${PHOTO_ENDPOINTS.uploadPhoto(eventId)}`,
      formData
    );
  }

  getPhotos(
    eventId: string,
    page: number,
    pageSize: number,
    visibleOnly?: boolean,
    mine?: boolean
  ): Observable<ApiResponse<PaginatedResponseModel<Photo>>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (visibleOnly !== undefined) {
      params = params.set('visibleOnly', visibleOnly);
    }

    if (mine !== undefined) {
      params = params.set('mine', mine);
    }

    return this.http.get<ApiResponse<PaginatedResponseModel<Photo>>>(
      `${this.apiUrl}${PHOTO_ENDPOINTS.getPhotos(eventId)}`,
      { params }
    );
  }

  deletePhoto(eventId: string, photoId: string): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}${PHOTO_ENDPOINTS.deletePhoto(eventId, photoId)}`
    );
  }

  toggleVisibility(
    eventId: string,
    photoId: string,
    isVisible: boolean
  ): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}${PHOTO_ENDPOINTS.toggleVisibility(eventId, photoId)}`,
      { isVisible }
    );
  }

  bulkToggleVisibility(
    eventId: string,
    photoIds: string[],
    isVisible: boolean
  ): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}${PHOTO_ENDPOINTS.bulkUpdateVisibility(eventId)}`,
      { photoIds, isVisible }
    );
  }
}
