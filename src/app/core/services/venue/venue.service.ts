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
      this.toFormData(request),
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
      this.toFormData(request),
    );
  }

  private toFormData(request: CreateVenueRequest | UpdateVenueRequest): FormData {
    const formData = new FormData();
    formData.append('Name', request.name);
    formData.append('Description', request.description ?? '');
    formData.append('Address', request.address ?? '');
    formData.append('Capacity', String(request.capacity));
    if (request.image) formData.append('Image', request.image, request.image.name);
    return formData;
  }

  deleteVenue(eventId: string, venueId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      this.api.getUrl(VENUE_ENDPOINTS.deleteVenue(eventId, venueId)),
    );
  }
}
