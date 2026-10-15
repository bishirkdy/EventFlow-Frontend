import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { NavigationItemService } from '../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { NavigationItemModel } from '../../../../core/models/navigation-item';
import { createAsyncAction } from 'core/state';
@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(NavigationItemService);
  private readonly state = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);
  readonly items = signal<NavigationItemModel[]>([]);
  private readonly loadAction = createAsyncAction(
    (eventId: string) => this.service.getItems(eventId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load navigation items.',
      onSuccess: (r) => this.items.set([...(r.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)),
    },
  );
  private readonly deleteAction = createAsyncAction(
    (id: string, item: NavigationItemModel) => this.service.deleteItem(id, item.id),
    {
      errorFallback: 'Failed to delete navigation item.',
      onSuccess: (r) => {
        this.toastr.success(r.message);
        this.loadItems();
      },
    },
  );
  private readonly toggleAction = createAsyncAction(
    (id: string, item: NavigationItemModel) => this.service.setVisibility(id, item.id, !item.isVisible),
    {
      errorFallback: 'Failed to update visibility.',
      onSuccess: (r) => {
        this.toastr.success(r.message);
        this.loadItems();
      },
    },
  );
  private readonly reorderAction = createAsyncAction(
    (id: string, ids: string[]) => this.service.reorderItems(id, ids),
    {
      errorFallback: 'Failed to reorder navigation items.',
      onSuccess: (r) => {
        this.toastr.success(r.message);
        this.loadItems();
      },
    },
  );
  readonly loading = this.loadAction.pending;
  ngOnInit(): void {
    this.loadItems();
  }
  loadItems(): void {
    const eventId = this.state.eventId();
    if (!eventId) {
      this.toastr.error('Event information is missing.');
      return;
    }
    this.loadAction.run(eventId);
  }
  createItem(): void {
    this.router.navigate(['/organizer', this.state.eventId(), 'navigation', 'create']);
  }
  editItem(item: NavigationItemModel): void {
    this.router.navigate(['/organizer', this.state.eventId(), 'navigation', item.id, 'edit']);
  }
  deleteItem(item: NavigationItemModel): void {
    const id = this.state.eventId();
    if (!id || !confirm(`Delete "${item.label}"?`)) return;
    this.deleteAction.run(id, item);
  }
  toggleVisibility(item: NavigationItemModel): void {
    const id = this.state.eventId();
    if (!id) return;
    this.toggleAction.run(id, item);
  }
  moveItem(item: NavigationItemModel, direction: -1 | 1): void {
    const id = this.state.eventId();
    if (!id) return;
    const list = [...this.items()].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = list.findIndex((x) => x.id === item.id),
      t = i + direction;
    if (i < 0 || t < 0 || t >= list.length) return;
    [list[i], list[t]] = [list[t], list[i]];
    this.reorderAction.run(id, list.map((x) => x.id));
  }
}
