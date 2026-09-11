import { Component } from '@angular/core';

interface OrganizerBenefit {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-for-organizers',
  imports: [],
  templateUrl: './for-organizers.html',
  styleUrl: './for-organizers.css',
})
export class ForOrganizers {
  benefits: OrganizerBenefit[] = [
    {
      number: '01',
      title: 'Build your event website',
      description:
        'Create a professional event website with custom pages, sections, content, and navigation.',
    },
    {
      number: '02',
      title: 'Manage everything in one place',
      description:
        'Keep your schedules, venues, participants, registrations, attendance, and event operations connected.',
    },
    {
      number: '03',
      title: 'Give participants a better experience',
      description:
        'Make registration, event updates, check-in, communication, feedback, and participation simple.',
    },
  ];
}
