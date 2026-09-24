import { Component, input } from '@angular/core';

import { WebsiteHeader } from '../../components/website-header/website-header';
import { WebsiteNavigation } from '../../components/website-navigation/website-navigation';
import { WebsiteFooter } from '../../components/website-footer/website-footer';
import { PageSectionRenderer } from '../../components/page-section-renderer/page-section-renderer';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';
import { PageSectionModel } from '../../../../core/models/event-page-section/PageSectionModel';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-festival-template',
  standalone: true,
  imports: [
    WebsiteHeader,
    WebsiteNavigation,
    WebsiteFooter,
    PageSectionRenderer,
  ],
  templateUrl: './festival-template.html',
  styleUrl: './festival-template.css',
})
export class FestivalTemplate {
  readonly data = input.required<EventWebsiteData>();

  hasFeature(code: string): boolean {
    const normalizedCode = code.trim().toLowerCase();

    return this.data().features.some(
      (feature) =>
        feature.featureCode.trim().toLowerCase() === normalizedCode &&
        feature.isEnabled,
    );
  }

  sectionsForPage(pageId: string): PageSectionModel[] {
    return this.data()
      .pageSections
      .filter((section) => section.pageId === pageId && section.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  visiblePages(): EventPageModel[] {
    return [...this.data().pages].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
