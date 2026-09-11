import { Component } from '@angular/core';

interface JourneyStep {
  number: string;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-event-journey',
  imports: [],
  templateUrl: './event-journey.html',
  styleUrl: './event-journey.css',
})

export class EventJourney {
  steps: JourneyStep[] = [
    {
      number: '01',
      title: 'Plan',
      description:
        'Start by defining your event, audience, dates, venues, and goals. EventFlow gives organizers a structured foundation for building their event.',
      image: '/images/journey/img1.png',
    },
    {
      number: '02',
      title: 'Create',
      description:
        'Build your event website using customizable pages, sections, navigation, and content. Create a professional event experience without starting from scratch.',
      image: '/images/journey/img2.png',
    },
    {
      number: '03',
      title: 'Organize',
      description:
        'Manage sessions, schedules, venues, speakers, sponsors, and event teams from one centralized event workspace.',
      image: '/images/journey/img3.png',
    },
    {
      number: '04',
      title: 'Engage',
      description:
        'Connect with participants through registration, announcements, notifications, feedback, and personalized event experiences.',
      image: '/images/journey/img4.png',
    },
    {
      number: '05',
      title: 'Experience',
      description:
        'Deliver your event smoothly with attendance tracking, participant management, media, certificates, and event insights.',
      image: '/images/journey/img5.png',
    },
  ];
}
