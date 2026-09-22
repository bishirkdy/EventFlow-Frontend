import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NavigationMenuService } from '../../../../../core/services/navigation-menu/navigation-menu.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { NavigationMenuModel } from '../../../../../core/models/navigation-menu/navigation-menu.model';


@Component({
  selector: 'app-navigation-menu-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './navigation-menu-details.html',
  styleUrl: './navigation-menu-details.css',
})
export class NavigationMenuDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  menuId = '';
  menu: NavigationMenuModel | null = null;

  loading = true;

  ngOnInit(): void {
    this.menuId =
      this.route.snapshot.paramMap.get('menuId') ?? '';

    if (!this.menuId) {
      this.toastr.error('Navigation menu ID is required.');
      return;
    }

    this.loadMenu();
  }

  loadMenu(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID is required.');
      return;
    }

    this.navigationMenuService
      .getMenuById(eventId, this.menuId)
      .subscribe({
        next: (response) => {
          this.menu = response.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to load navigation menu.');
        },
      });
  }

  editMenu(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
      'edit',
    ]);
  }

  viewItems(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
      'items',
    ]);
  }

  deleteMenu(): void {
    if (!this.menu) {
      return;
    }

    if (!confirm(`Delete "${this.menu.name}"?`)) {
      return;
    }

    const eventId = this.eventState.eventId();

    if (!eventId) {
      return;
    }

    this.navigationMenuService
      .deleteMenu(eventId, this.menuId)
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);

          this.router.navigate([
            '/organizer',
            eventId,
            'navigation-menus',
          ]);
        },
        error: () => {
          this.toastr.error('Failed to delete navigation menu.');
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
    ]);
  }
}