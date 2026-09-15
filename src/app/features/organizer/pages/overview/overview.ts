import { Component, inject } from '@angular/core';
import {DatePipe} from '@angular/common';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-overview',
  imports: [DatePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  organizerEventState = inject(OrganizerEventStateService);
  event = this.organizerEventState.event;
}