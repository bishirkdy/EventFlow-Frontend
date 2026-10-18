import { Component, computed, inject, signal } from '@angular/core';
import { createAsyncState } from '@/core/state';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { AdminUserListItem } from '../../../../core/models/admin';
import { PaginatedResponseModel } from '../../../../core/models/common';
import { AsyncState } from '../../../../shared/components/async-state/async-state';

@Component({
  selector: 'app-admin-users',
  imports: [AsyncState],
  templateUrl: './users.html'
})
export class AdminUsers {
  private readonly admin = inject(AdminService);

  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly search = signal('');

  private readonly state = createAsyncState<PaginatedResponseModel<AdminUserListItem>>(
    () =>
      this.admin.getUsers({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search() || null
      }),
    { errorFallback: 'Failed to load users.' }
  );

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly users = computed(() => this.state.data()?.items ?? []);
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
