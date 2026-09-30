import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { TicketModel } from '../../../../../core/models/registration/ticket.model';
import { QrCodeComponent } from '../qr-code/qr-code';

@Component({
  selector: 'app-registration-ticket',
  standalone: true,
  imports: [DatePipe, QrCodeComponent],
  templateUrl: './ticket.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketComponent {
  readonly ticket = input.required<TicketModel>();

  protected readonly isRevoked = (): boolean =>
    this.ticket().revokedAtUtc !== null || !this.ticket().isActive;
}
