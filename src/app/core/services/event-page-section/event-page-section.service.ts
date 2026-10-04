import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../models/common/api-response';
import { PageSectionModel } from '../../models/event-page-section/PageSectionModel';
import { Api } from '../../api/api';
import { HttpClient } from '@angular/common/http';
import { PAGE_SECTION_ENDPOINTS } from '../../api/endpoints/event-features/event-page-section.endpoints';
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

  /** Every published page section of an event, in one request. */
  getSectionsByEvent(eventId: string): Observable<ApiResponse<PageSectionModel[]>> {
    return this.http.get<ApiResponse<PageSectionModel[]>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.getSectionsByEvent(eventId)),
    );
  }

  /** Includes draft pages' sections, for the organizer website preview. */
  getSectionsByEventPreview(eventId: string): Observable<ApiResponse<PageSectionModel[]>> {
    return this.http.get<ApiResponse<PageSectionModel[]>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.getSectionsByEventPreview(eventId)),
    );
  }

  /** Includes hidden sections, only for organizer screens. */
  getManageSections(pageId: string): Observable<ApiResponse<PageSectionModel[]>> {
    return this.http.get<ApiResponse<PageSectionModel[]>>(
      this.api.getUrl(PAGE_SECTION_ENDPOINTS.getManageSections(pageId)),
    );
  }

  createSection(pageId: string, request: CreatePageSectionModel): Observable<ApiResponse<string>> {
    const formData = new FormData();

    formData.append('sectionType', request.sectionType);

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
