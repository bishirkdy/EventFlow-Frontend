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

  type(): string {
    return this.section().sectionType.trim().toLowerCase();
  }

  title(): string {
    return this.section().title?.trim() ?? '';
  }

  content(): string {
    const value = this.section().content?.trim() ?? '';
    return /lorem ipsum|dummy text/i.test(value) ? '' : value;
  }

  image(): string | null {
    return this.section().imageUrl || this.data().images[0]?.url || null;
  }
}
