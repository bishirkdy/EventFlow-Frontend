import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/common/api-response';
import { Api } from '../../api/api';
import { VenueModel } from '../../models/venue/venue.model';
import { CreateVenueRequest } from '../../models/venue/create-venue.model';
import { UpdateVenueRequest } from '../../models/venue/update-venue.model';
import { VENUE_ENDPOINTS } from '../../api/endpoints/venue.endpoint';

@Injectable({
  providedIn: 'root',
})

export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getVenues(eventId: string): Observable<ApiResponse<VenueModel[]>> {
    return this.http.get<ApiResponse<VenueModel[]>>(
      this.api.getUrl(VENUE_ENDPOINTS.getVenues(eventId)),
    );
  }

  createVenue(eventId: string, request: CreateVenueRequest): Observable<ApiResponse<VenueModel>> {
    return this.http.post<ApiResponse<VenueModel>>(
      this.api.getUrl(VENUE_ENDPOINTS.createVenue(eventId)),
      request,
    );
  }

  getVenueById(eventId: string, venueId: string): Observable<ApiResponse<VenueModel>> {
    return this.http.get<ApiResponse<VenueModel>>(
      this.api.getUrl(VENUE_ENDPOINTS.getVenueById(eventId, venueId)),
    );
  }

  updateVenue(eventId: string, venueId: string, request: UpdateVenueRequest): Observable<void> {
    return this.http.put<void>(
      this.api.getUrl(VENUE_ENDPOINTS.updateVenue(eventId, venueId)),
      request,
    );
  }
}
