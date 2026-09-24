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
    const items = this.data().navigationItems
      .filter((item) => item.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const primaryMenuIds = new Set(
      this.data().navigationMenus
        .filter((menu) => {
          const location = menu.location.trim().toLowerCase();
          return location === 'header' || location === 'main' || location === 'primary';
        })
        .map((menu) => menu.id),
    );

    if (primaryMenuIds.size === 0) {
      return items;
    }

    return items.filter((item) => primaryMenuIds.has(item.navigationMenuId));
  }

  href(item: NavigationItemModel): string {
    if (item.url?.trim()) {
      return item.url;
    }

    if (item.pageId) {
      const page = this.data().pages.find((candidate) => candidate.id === item.pageId);
      if (page) {
        return `#page-${page.id}`;
      }
    }

    return '#';
  }
}
