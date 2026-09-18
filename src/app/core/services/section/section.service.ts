import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response';
import { CreateSectionRequest, SectionModel } from '../../models/section/section.model';
import { Api } from '../api';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  private readonly endpoint = '/v1/section';

  getSections(eventId: string): Observable<ApiResponse<SectionModel[]>> {
    return this.http.get<ApiResponse<SectionModel[]>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sections`),
      {
        withCredentials: true,
      },
    );
  }

  createSection(
    eventId: string,
    request: CreateSectionRequest,
  ): Observable<ApiResponse<SectionModel>> {
    return this.http.post<ApiResponse<SectionModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sections`),
      request,
      {
        withCredentials: true,
      },
    );
  }

  getSectionById(eventId: string, sectionId: string): Observable<ApiResponse<SectionModel>> {
    return this.http.get<ApiResponse<SectionModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sections/${sectionId}`),
      {
        withCredentials: true,
      },
    );
  }

  deleteSection(eventId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sections/${sectionId}`),
      {
        withCredentials: true,
      },
    );
  }
}
