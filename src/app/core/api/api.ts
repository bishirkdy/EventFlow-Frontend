import { inject, Injectable } from '@angular/core';
import { AppConfigService } from '../config/app-config.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = environment.production
    ? 'https://eventflow-app.duckdns.org/api'
    : 'http://localhost:5000/api';

  getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}