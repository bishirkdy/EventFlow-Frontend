import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../models/common/api-response';
import { PageSectionModel } from '../../models/event-page-section/PageSectionModel';
import { Api } from '../../api/api';
import { HttpClient } from '@angular/common/http';
import { PAGE_SECTION_ENDPOINTS } from '../../api/endpoints/event-page-section.endpoints';
import { Observable } from 'rxjs';
import { CreatePageSectionModel } from '../../models/event-page-section/CreatePageSectionModel';
import { UpdatePageSectionModel } from '../../models/event-page-section/UpdatePageSectionModel';

@Injectable({
  providedIn: 'root',
})
export class EventPageSectionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSections(pageId: string): Observable<ApiResponse<PageSectionModel[]>> {
    return this.http.get<ApiResponse<PageSectionModel[]>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.getSections(pageId)),
    );
  }

  createSection(pageId: string, request: CreatePageSectionModel): Observable<ApiResponse<string>> {
    const formData = new FormData();

    formData.append('sectionType', request.sectionType);
    formData.append('displayOrder', request.displayOrder.toString());

    if (request.title) {
      formData.append('title', request.title);
    }

    if (request.content) {
      formData.append('content', request.content);
    }

    if (request.image) {
      formData.append('image', request.image);
    }

    if (request.configuration) {
      formData.append('configuration', request.configuration);
    }

    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.createSection(pageId)),
      formData,
    );
  }

  updateSection(pageId: string,sectionId: string,request: UpdatePageSectionModel): Observable<ApiResponse<object | null>> {
    const formData = new FormData();

    formData.append('sectionType', request.sectionType);
    formData.append('displayOrder', request.displayOrder.toString());
    formData.append('isVisible', request.isVisible.toString());

    if (request.title) {
      formData.append('title', request.title);
    }

    if (request.content) {
      formData.append('content', request.content);
    }

    if (request.image) {
      formData.append('image', request.image);
    }

    if (request.configuration) {
      formData.append('configuration', request.configuration);
    }

    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.updateSection(pageId, sectionId)),
      formData,
    );
  }

  deleteSection(pageId: string, sectionId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.deleteSection(pageId, sectionId)),
    );
  }

  reorderSections(pageId: string, sectionIds: string[]): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.reorderSections(pageId)),
      sectionIds,
    );
  }
}
