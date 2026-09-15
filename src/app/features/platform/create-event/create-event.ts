import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../../../core/services/event/event.service';

@Component({
  selector: 'app-create-event',
  imports: [FormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private router = inject(Router);
  private eventService = inject(EventService);
  private toastr = inject(ToastrService);

  eventName = '';
  eventType = '';
  startDate = '';
  endDate = '';
  description = '';
  timeZone= 'Asia/Kolkata';


  eventTypes = [
    'Wedding & Private Events',
    'Conference & Business',
    'Education & Workshop',
    'Festival & Cultural',
    'Sports & Competition',
  ];

  createEvent(): void {
    this.eventService.createEvent({
      name: this.eventName,
      eventType: this.eventType,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      timeZone: this.timeZone,
    }).subscribe({
      next: (response) => {
        this.toastr.success('Event created successfully!');
      },
      error: (error) => {
        this.toastr.error('Failed to create event.');
        console.error('Create event failed:', error);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

}
