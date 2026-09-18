import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { SECTION_ENDPOINTS } from '../../api/endpoints/section.endpoint';

import { ApiResponse } from '../../models/common/api-response';
import { SectionModel } from '../../models/section/section.model';
import { CreateSectionRequest } from '../../models/section/create-section.model';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSections(eventId: string): Observable<ApiResponse<SectionModel[]>> {
    return this.http.get<ApiResponse<SectionModel[]>>(
      this.api.getUrl(SECTION_ENDPOINTS.getSections(eventId)),
    );
  }

  createSection(
    eventId: string,
    request: CreateSectionRequest,
  ): Observable<ApiResponse<SectionModel>> {
    return this.http.post<ApiResponse<SectionModel>>(
      this.api.getUrl(SECTION_ENDPOINTS.createSection(eventId)),
      request,
    );
  }

  getSectionById(eventId: string, sectionId: string): Observable<ApiResponse<SectionModel>> {
    return this.http.get<ApiResponse<SectionModel>>(
      this.api.getUrl(SECTION_ENDPOINTS.getSectionById(eventId, sectionId)),
    );
  }

  deleteSection(eventId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(
      this.api.getUrl(SECTION_ENDPOINTS.deleteSection(eventId, sectionId)),
    );
  }
}
