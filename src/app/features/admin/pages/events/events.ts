import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createAsyncState } from '@/core/state';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { AdminEventListItem } from '../../../../core/models/admin';
import { PaginatedResponseModel } from '../../../../core/models/common';
import { AsyncState } from '../../../../shared/components/async-state/async-state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

@Component({
  selector: 'app-admin-events',
  imports: [RouterLink, DatePipe, AsyncState, CapitalizePipe],
  templateUrl: './events.html'
})
export class AdminEvents {
  private readonly admin = inject(AdminService);

  readonly statusOptions = ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'];

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly status = signal('');
  readonly search = signal('');

  private readonly state = createAsyncState<PaginatedResponseModel<AdminEventListItem>>(
    () =>
      this.admin.getEvents({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.status() || null,
        search: this.search() || null
      }),
    { errorFallback: 'Failed to load events.' }
  );

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly events = computed(() => this.state.data()?.items ?? []);
  readonly totalCount = computed(() => this.state.data()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.state.data()?.totalPages ?? 0);

  constructor() {
    this.state.load();
  }

  applySearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.state.load();
  }

  applyStatus(value: string): void {
    this.status.set(value);
    this.page.set(1);
    this.state.load();
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update((page) => page - 1);
      this.state.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((page) => page + 1);
      this.state.load();
    }
  }

  reload(): void {
    this.state.load();
  }
}
