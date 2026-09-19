import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EVENT_IMAGE_ENDPOINTS } from '../../api/endpoints/event-image.endpoint';

@Injectable({
  providedIn: 'root',
})
export class EventImageService {
  private readonly http = inject(HttpClient);

  uploadImages(eventId: string, images: File[]) {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append('Images', image);
    });

    return this.http.post(
      EVENT_IMAGE_ENDPOINTS.uploadImages(eventId),
      formData
    );
  }
}