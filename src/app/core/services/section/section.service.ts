import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { SECTION_ENDPOINTS } from '../../api/endpoints/section.endpoint';
import { ApiResponse } from '../../models/common/api-response';

import { SectionModel } from '../../models/section/section.model';
import { CreateSectionModel } from '../../models/section/create-section.model';
import { UpdateSectionModel } from '../../models/section/update-section.model';

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

  getSectionById(sectionId: string): Observable<ApiResponse<SectionModel>> {
    return this.http.get<ApiResponse<SectionModel>>(
      this.api.getUrl(SECTION_ENDPOINTS.getSectionById(sectionId)),
    );
  }

  createSection(eventId: string, request: CreateSectionModel): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(SECTION_ENDPOINTS.createSection(eventId)),
      request,
    );
  }

  updateSection(eventId: string, sectionId: string, request: UpdateSectionModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(SECTION_ENDPOINTS.updateSection(eventId, sectionId)),
      request,
    );
  }

  deleteSection(eventId: string, sectionId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(SECTION_ENDPOINTS.deleteSection(eventId, sectionId)),
    );
  }
}
