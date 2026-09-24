import { Component, input } from '@angular/core';

import { PageSectionModel } from '../../../../core/models/event-page-section/PageSectionModel';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-page-section-renderer',
  standalone: true,
  templateUrl: './page-section-renderer.html',
  styleUrl: './page-section-renderer.css',
})
export class PageSectionRenderer {
  readonly section = input.required<PageSectionModel>();
  readonly data = input.required<EventWebsiteData>();

  sectionType(): string {
    return this.section().sectionType.trim().toLowerCase();
  }

  title(): string {
    return this.section().title?.trim() || '';
  }

  content(): string {
    return this.section().content?.trim() || '';
  }
}
