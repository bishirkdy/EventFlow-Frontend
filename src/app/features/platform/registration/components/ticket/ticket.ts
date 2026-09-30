import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { TicketModel } from '../../../../../core/models/registration/ticket.model';
import { DatePipe } from '@angular/common';
import { QrCodeComponent } from '../qr-code/qr-code';



@Component({
  selector: 'app-registration-ticket',
  imports : [DatePipe , QrCodeComponent],
  standalone: true,
  templateUrl: './ticket.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketComponent {
  readonly ticket = input.required<TicketModel>();

  protected readonly isRevoked = (): boolean =>
    this.ticket().revokedAtUtc !== null || !this.ticket().isActive;
}