import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = inject(HttpClient);

  private config: AppConfig = {
    apiUrl: 'https://eventflow-app.duckdns.org/api',
  };

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('/config.json'),
    );
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }
}