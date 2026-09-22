import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';
import { EventPageSectionService } from '../../../../core/services/event-page-section/event-page-section.service';
import { PageSectionModel } from '../../../../core/models/event-page-section/PageSectionModel';
import { NavigationMenuService } from '../../../../core/services/navigation-menu/navigation-menu.service';
import { NavigationMenuModel } from '../../../../core/models/navigation-menu/navigation-menu.model';
import { NavigationItemService } from '../../../../core/services/navigation-item/navigation-item.service';
import { NavigationItemModel } from '../../../../core/models/navigation-item/navigation-item.model';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  templateUrl: './preview.html',
  styleUrl: './preview.css',
})
export class Preview implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly pageService = inject(EventPageService);
  private readonly sectionService = inject(EventPageSectionService);
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventState = inject(OrganizerEventStateService);

  readonly pages = signal<EventPageModel[]>([]);
  readonly sections = signal<PageSectionModel[]>([]);
  readonly navigationMenus = signal<NavigationMenuModel[]>([]);
  readonly navigationItems = signal<NavigationItemModel[]>([]);

  readonly selectedPage = signal<EventPageModel | null>(null);

  readonly loading = signal(true);

  private eventId = '';

  ngOnInit(): void {
    console.log('Preview ngOnInit');

    this.eventId = this.eventState.eventId() ?? '';

    console.log('Preview eventId:', this.eventId);

    if (!this.eventId) {
      console.log('No eventId');
      this.loading.set(false);
      return;
    }

    this.loadPreview();
  }

  loadPreview(): void {
    console.log('loadPreview started');

    this.loading.set(true);

    console.log('Calling getPages with:', this.eventId);

    this.pageService.getPages(this.eventId).subscribe({
      next: (response) => {
        console.log('Preview pages response:', response);

        const pages = response.data ?? [];

        console.log('Pages:', pages);

        this.pages.set(pages);

        const firstPage = pages.sort((a, b) => a.displayOrder - b.displayOrder)[0];

        console.log('First page:', firstPage);

        if (firstPage) {
          this.selectPage(firstPage);
        } else {
          console.log('No pages returned');
          this.loading.set(false);
        }

        this.loadNavigation();
      },

      error: (error) => {
        console.error('Failed to load preview pages:', error);
        this.loading.set(false);
      },
    });
  }

  loadNavigation(): void {
    this.navigationMenuService.getMenus(this.eventId).subscribe({
      next: (response) => {
        const menus = response.data ?? [];

        this.navigationMenus.set(menus);

        if (menus.length === 0) {
          return;
        }

        this.navigationItemService.getItems(menus[0].id).subscribe({
          next: (itemResponse) => {
            this.navigationItems.set(itemResponse.data ?? []);
          },
        });
      },
    });
  }

  selectPage(page: EventPageModel): void {
    this.selectedPage.set(page);

    this.sectionService.getSections(page.id).subscribe({
      next: (response) => {
        this.sections.set(
          (response.data ?? [])
            .filter((section) => section.isVisible)
            .sort((a, b) => a.displayOrder - b.displayOrder),
        );

        this.loading.set(false);
      },

      error: () => {
        this.sections.set([]);
        this.loading.set(false);
      },
    });
  }
}
