import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { Api } from '../api';
import { CreateVenueRequest, UpdateVenueRequest, VenueModel } from '../../models/venue/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private http = inject(HttpClient);
  private api = inject(Api);

  private readonly endpoint = '/v1/events';

  getVenues(eventId: string): Observable<ApiResponse<VenueModel[]>> {
    return this.http.get<ApiResponse<VenueModel[]>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/venues`),
      { withCredentials: true },
    );
  }

  createVenue(eventId: string, request: CreateVenueRequest): Observable<ApiResponse<VenueModel>> {
    return this.http.post<ApiResponse<VenueModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/venues`),
      request,
      { withCredentials: true },
    );
  }

  getVenueById(eventId: string, venueId: string): Observable<ApiResponse<VenueModel>> {
    return this.http.get<ApiResponse<VenueModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/venues/${venueId}`),
      { withCredentials: true },
    );
  }

  updateVenue(eventId: string, venueId: string, request: UpdateVenueRequest): Observable<void> {
    return this.http.put<void>(
      this.api.getUrl(`${this.endpoint}/${eventId}/venues/${venueId}`),
      request,
      { withCredentials: true },
    );
  }
}
