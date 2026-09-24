import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { NavigationItemModel } from '../../../../../core/models/navigation-item/navigation-item.model';



@Component({
  selector: 'app-navigation-items',
  standalone: true,
  templateUrl: './navigation-items.html',
  styleUrl: './navigation-items.css',
})
export class NavigationItems implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly items = signal<NavigationItemModel[]>([]);
  readonly loading = signal(false);

  menuId = '';

  ngOnInit(): void {
    this.menuId =
      this.route.snapshot.paramMap.get('menuId') ?? '';

    if (!this.menuId) {
      this.toastr.error('Navigation menu ID is required.');
      return;
    }

    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);

    this.navigationItemService
      .getItems(this.menuId)
      .subscribe({
        next: (response) => {
          this.items.set(response.data ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toastr.error('Failed to load navigation items.');
        },
      });
  }

  createItem(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
      'items',
      'create',
    ]);
  }

  editItem(item: NavigationItemModel): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
      'items',
      item.id,
      'edit',
    ]);
  }

  deleteItem(item: NavigationItemModel): void {
    if (!confirm(`Delete "${item.label}"?`)) {
      return;
    }

    this.navigationItemService
      .deleteItem(this.menuId, item.id)
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.loadItems();
        },
        error: () => {
          this.toastr.error('Failed to delete navigation item.');
        },
      });
  }

  toggleVisibility(item: NavigationItemModel): void {
    this.navigationItemService
      .setVisibility(
        this.menuId,
        item.id,
        !item.isVisible,
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.loadItems();
        },
        error: () => {
          this.toastr.error('Failed to update visibility.');
        },
      });
  }

  moveItem(item: NavigationItemModel, direction: -1 | 1): void {
    const current = [...this.items()].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = current.findIndex(x => x.id === item.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return;

    [current[index], current[target]] = [current[target], current[index]];
    const itemIds = current.map(x => x.id);
    this.navigationItemService.reorderItems(this.menuId, itemIds).subscribe({
      next: (response) => { this.toastr.success(response.message); this.loadItems(); },
      error: () => this.toastr.error('Failed to reorder navigation items.'),
    });
  }

  reorderItems(): void {
    const itemIds = this.items().map(item => item.id);

    this.navigationItemService
      .reorderItems(this.menuId, itemIds)
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);
          this.loadItems();
        },
        error: () => {
          this.toastr.error('Failed to reorder navigation items.');
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
    ]);
  }
}