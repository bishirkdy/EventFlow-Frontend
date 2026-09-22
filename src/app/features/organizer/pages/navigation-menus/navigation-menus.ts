import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationMenuService } from '../../../../core/services/navigation-menu/navigation-menu.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { NavigationMenuModel } from '../../../../core/models/navigation-menu/navigation-menu.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-navigation-menus',
  imports : [DatePipe],
  templateUrl: './navigation-menus.html',
  styleUrl: './navigation-menus.css',
})
export class NavigationMenus implements OnInit {
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly menus = signal<NavigationMenuModel[]>([]);
  readonly loading = signal(false);

  readonly eventId = this.eventState.eventId;

  ngOnInit(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.toastr.error('Event ID is required.');
      return;
    }

    this.loadMenus();
  }

  loadMenus(): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.loading.set(true);

    this.navigationMenuService.getMenus(eventId).subscribe({
      next: (response) => {
        this.menus.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load navigation menus.');
      },
    });
  }

  createMenu(): void {
    this.router.navigate(['/organizer', this.eventId(), 'navigation-menus', 'create']);
  }

  viewMenu(menu: NavigationMenuModel): void {
    this.router.navigate(['/organizer', this.eventId(), 'navigation-menus', menu.id]);
  }

  editMenu(menu: NavigationMenuModel): void {
    this.router.navigate(['/organizer', this.eventId(), 'navigation-menus', menu.id, 'edit']);
  }

  deleteMenu(menu: NavigationMenuModel): void {
    if (!confirm(`Delete "${menu.name}"?`)) {
      return;
    }

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.navigationMenuService.deleteMenu(eventId, menu.id).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.loadMenus();
      },
      error: () => {
        this.toastr.error('Failed to delete navigation menu.');
      },
    });
  }
}
