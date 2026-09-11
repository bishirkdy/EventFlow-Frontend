import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

interface UpcomingEvent {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
}

@Component({
  selector: 'app-upcoming-events',
  imports: [RouterLink],
  templateUrl: './upcoming-events.html',
  styleUrl: './upcoming-events.css',
})
export class UpcomingEvents {
  events: UpcomingEvent[] = [
    {
      id: '1',
      name: 'Tech Innovation Summit',
      slug: 'tech-innovation-summit',
      imageUrl: '/images/journey/img3.png',
      eventType: 'Conference',
      startDate: '2026-10-18',
      endDate: '2026-10-19',
      location: 'Calicut, Kerala',
    },
    {
      id: '2',
      name: 'Future of Design',
      slug: 'future-of-design',
      imageUrl: '/images/journey/img3.png',
      eventType: 'Workshop',
      startDate: '2026-10-25',
      endDate: '2026-10-25',
      location: 'Kochi, Kerala',
    },
    {
      id: '3',
      name: 'Kerala Cultural Festival',
      slug: 'kerala-cultural-festival',
      imageUrl: '/images/journey/img3.png',
      eventType: 'Festival',
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      location: 'Kozhikode, Kerala',
    },
  ];

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }
}
