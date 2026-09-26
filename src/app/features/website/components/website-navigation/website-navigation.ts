import { Component, input } from '@angular/core';
import { NavigationItemModel } from '../../../../core/models/navigation-item/navigation-item.model';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-website-navigation',
  standalone: true,
  templateUrl: './website-navigation.html',
  styleUrl: './website-navigation.css',
})
export class WebsiteNavigation {
  readonly data = input.required<EventWebsiteData>();

  visibleItems(): NavigationItemModel[] {
    const publishedPageIds = new Set(this.data().pages.filter(page => page.isPublished).map(page => page.id));
    const items = this.data()
      .navigationItems.filter((item) => item.isVisible && (!item.pageId || publishedPageIds.has(item.pageId)))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return items;
  }

  href(item: NavigationItemModel): string {
    if (item.pageId) {
      const page = this.data().pages.find((candidate) => candidate.id === item.pageId);
      if (page) return `#page-${page.id}`;
    }

    return '#';
  }
}
