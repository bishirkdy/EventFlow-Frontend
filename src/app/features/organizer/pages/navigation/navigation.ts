import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { NavigationItemService } from '../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { NavigationItemModel } from '../../../../core/models/navigation-item/navigation-item.model';
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
  readonly loading = signal(false);
  ngOnInit(): void {
    this.loadItems();
  }
  loadItems(): void {
    const eventId = this.state.eventId();
    if (!eventId) {
      this.toastr.error('Event information is missing.');
      return;
    }
    this.loading.set(true);
    this.service.getItems(eventId).subscribe({
      next: (r) => {
        this.items.set([...(r.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder));
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.toastr.error(this.apiMessage(e, 'Failed to load navigation items.'));
      },
    });
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
    this.service.deleteItem(id, item.id).subscribe({
      next: (r) => {
        this.toastr.success(r.message);
        this.loadItems();
      },
      error: (e) => this.toastr.error(this.apiMessage(e, 'Failed to delete navigation item.')),
    });
  }
  toggleVisibility(item: NavigationItemModel): void {
    const id = this.state.eventId();
    if (!id) return;
    this.service.setVisibility(id, item.id, !item.isVisible).subscribe({
      next: (r) => {
        this.toastr.success(r.message);
        this.loadItems();
      },
      error: (e) => this.toastr.error(this.apiMessage(e, 'Failed to update visibility.')),
    });
  }
  moveItem(item: NavigationItemModel, direction: -1 | 1): void {
    const id = this.state.eventId();
    if (!id) return;
    const list = [...this.items()].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = list.findIndex((x) => x.id === item.id),
      t = i + direction;
    if (i < 0 || t < 0 || t >= list.length) return;
    [list[i], list[t]] = [list[t], list[i]];
    this.service
      .reorderItems(
        id,
        list.map((x) => x.id),
      )
      .subscribe({
        next: (r) => {
          this.toastr.success(r.message);
          this.loadItems();
        },
        error: (e) => this.toastr.error(this.apiMessage(e, 'Failed to reorder navigation items.')),
      });
  }
  private apiMessage(error: unknown, fallback: string): string {
    const r = (error as { error?: { message?: string; errors?: string[] } })?.error;
    return r?.errors?.join(' ') || r?.message || fallback;
  }
}
