import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ticket',
  standalone: true,
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class TicketComponent {
  readonly label = input('Ticket');
}
