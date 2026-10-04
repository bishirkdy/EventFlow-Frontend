import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-attendance-staff-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-background text-text-primary">
      <header class="border-b border-border bg-surface">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">EventFlow</p>
            <h1 class="mt-1 text-lg font-semibold">Attendance Staff</h1>
          </div>
          <nav class="flex items-center gap-2 text-sm">
            <a [routerLink]="['dashboard']" class="rounded-lg border border-border px-3 py-2 hover:border-secondary">Dashboard</a>
            <a [routerLink]="['scan']" class="rounded-lg bg-primary px-3 py-2 text-white hover:opacity-90">Scan QR</a>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AttendanceStaffLayout {
  readonly route = inject(ActivatedRoute);
}
