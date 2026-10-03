import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceDashboardModel } from '../../../../core/models/operations/operations.model';
import { NotificationService } from '../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-attendance-staff-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class AttendanceStaffDashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly operations = inject(OperationsService);
  private readonly notify = inject(NotificationService);
  readonly eventId = this.route.parent?.snapshot.paramMap.get('eventId') ?? this.route.snapshot.paramMap.get('eventId');
  readonly dashboard = signal<AttendanceDashboardModel | null>(null);
  readonly loading = signal(true);

  constructor() {
    if (this.eventId) this.load();
    else { this.loading.set(false); this.notify.error(null, 'Event context is missing.'); }
  }

  private load(): void {
    this.operations.dashboard(this.eventId!).subscribe({
      next: response => { this.dashboard.set(response.data); this.loading.set(false); },
      error: error => { this.loading.set(false); this.notify.error(error, 'Unable to load attendance dashboard.'); },
    });
  }
}
