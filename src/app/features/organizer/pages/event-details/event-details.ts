import { Component, inject } from '@angular/core';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private eventState = inject(OrganizerEventStateService);
  event = this.eventState.event;
}
