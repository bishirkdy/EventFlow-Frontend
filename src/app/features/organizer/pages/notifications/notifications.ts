import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { NotificationModel } from '../../../../core/models/operations';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { createAsyncAction } from 'core/state';
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly state = inject(OrganizerEventStateService);
  private readonly ops = inject(OperationsService);
  private readonly toast = inject(NotificationService);
  readonly items = signal<NotificationModel[]>([]);
  recipientEmail = '';
  subject = '';
  body = '';
  private readonly loadAction = createAsyncAction((id: string) => this.ops.notifications(id), {
    onSuccess: (r) => this.items.set(r.data ?? []),
  });
  private readonly sendAction = createAsyncAction(
    (id: string) =>
      this.ops
        .queueNotification(id, {
          userId: null,
          recipientEmail: this.recipientEmail,
          subject: this.subject,
          body: this.body,
          scheduledAtUtc: null,
        })
        .pipe(map((r) => ({ id, r }))),
    {
      onSuccess: ({ id, r }) => {
        if (r.isSuccess) {
          this.toast.success('Notification queued');
          this.recipientEmail = '';
          this.subject = '';
          this.body = '';
          this.load(id);
        } else this.toast.error(r.message || 'Unable to queue notification');
      },
    },
  );
  constructor() {
    const id = this.state.eventId();
    if (id) this.load(id);
  }
  load(id: string) {
    this.loadAction.run(id);
  }
  send() {
    const id = this.state.eventId();
    if (!id) return;
    this.sendAction.run(id);
  }
}
