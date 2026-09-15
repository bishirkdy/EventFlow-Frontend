import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationMenuService } from '../../../../core/services/navigation-menu/navigation-menu.service';
import { CreateNavigationMenuRequest, NavigationMenuModel, UpdateNavigationMenuRequest } from '../../../../core/models/navigation-menu/navigation-menu.model';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  private route = inject(ActivatedRoute);
  private navigationMenuService = inject(NavigationMenuService);
  private toastr = inject(ToastrService);

  menus = signal<NavigationMenuModel[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadMenus();
  }

  private getEventId(): string | null {
    return this.route.parent?.parent?.snapshot.paramMap.get('eventId') ?? null;
  }

  // GET
  loadMenus(): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.navigationMenuService.getNavigationMenus(eventId).subscribe({
      next: response => {
        this.menus.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error(error);
        this.toastr.error('Failed to load navigation menus.');
        this.loading.set(false);
      },
    });
  }

  // GET by ID
  getMenu(menuId: string): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    this.navigationMenuService
      .getNavigationMenuById(eventId, menuId)
      .subscribe({
        next: response => {
          console.log(response.data);
        },
        error: error => {
          console.error(error);
          this.toastr.error('Failed to load navigation menu.');
        },
      });
  }

  // CREATE
  createMenu(request: CreateNavigationMenuRequest): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    this.navigationMenuService
      .createNavigationMenu(eventId, request)
      .subscribe({
        next: response => {
          this.menus.update(menus => [
            ...menus,
            response.data,
          ]);

          this.toastr.success(
            'Navigation menu created successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to create navigation menu.'
          );
        },
      });
  }

  // UPDATE
  updateMenu(menuId: string, request: UpdateNavigationMenuRequest): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    this.navigationMenuService
      .updateNavigationMenu(eventId, menuId, request)
      .subscribe({
        next: response => {
          this.menus.update(menus =>
            menus.map(menu =>
              menu.id === menuId
                ? response.data
                : menu
            )
          );

          this.toastr.success(
            'Navigation menu updated successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to update navigation menu.'
          );
        },
      });
  }

  // DELETE
  deleteMenu(menuId: string): void {
    const eventId = this.getEventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    this.navigationMenuService
      .deleteNavigationMenu(eventId, menuId)
      .subscribe({
        next: () => {
          this.menus.update(menus =>
            menus.filter(menu => menu.id !== menuId)
          );

          this.toastr.success(
            'Navigation menu deleted successfully.'
          );
        },
        error: error => {
          console.error(error);
          this.toastr.error(
            'Failed to delete navigation menu.'
          );
        },
      });
  }
}
