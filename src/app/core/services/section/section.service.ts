import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { Api } from '../api';
import { HttpClient } from '@angular/common/http';
import { CreateSectionRequest, SectionModel } from '../../models/section/section.model';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getSections(eventId: string): Observable<ApiResponse<SectionModel[]>> {
    return this.http.get<ApiResponse<SectionModel[]>>(
      this.api.getUrl(`/v1/events/${eventId}/sections`),
      {
        withCredentials: true,
      }
    );
  }

  createSection(eventId: string, request: CreateSectionRequest
  ): Observable<ApiResponse<SectionModel>> {
    return this.http.post<ApiResponse<SectionModel>>(
      this.api.getUrl(`/v1/events/${eventId}/sections`),
      request,
      {
        withCredentials: true,
      }
    );
  }

  getSectionById(sectionId: string): Observable<ApiResponse<SectionModel>> {
    return this.http.get<ApiResponse<SectionModel>>(
      this.api.getUrl(`/v1/sections/${sectionId}`),
      {
        withCredentials: true,
      }
    );
  }
}
