import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { Api } from '../api';
import { CreateVenueRequest, VenueModel } from '../../models/venue/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getVenues(eventId: string): Observable<ApiResponse<VenueModel[]>> {
    return this.http.get<ApiResponse<VenueModel[]>>(
      this.api.getUrl(`/v1/events/${eventId}/venues`),
      { withCredentials: true }
    );
  }

  createVenue(eventId: string, request: CreateVenueRequest): Observable<ApiResponse<VenueModel>> {
    return this.http.post<ApiResponse<VenueModel>>(
      this.api.getUrl(`/v1/events/${eventId}/venues`),
      request,
      { withCredentials: true }
    );
  }

  getVenueById(eventId: string, venueId: string): Observable<ApiResponse<VenueModel>> {
    return this.http.get<ApiResponse<VenueModel>>(
      this.api.getUrl(`/v1/events/${eventId}/venues/${venueId}`),
      { withCredentials: true }
    );
  }
}
