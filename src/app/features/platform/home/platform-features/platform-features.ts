import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface PlatformFeature {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-platform-features',
  imports: [FormsModule],
  templateUrl: './platform-features.html',
  styleUrl: './platform-features.css',
})
export class PlatformFeatures {
    activeFeature = signal(0);

  features: PlatformFeature[] = [
    {
      title: 'Event Management',
      description:
        'Create and configure your event workspace, settings, dates, and event experience from one place.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Event Website & Pages',
      description:
        'Build beautiful event websites with custom pages, sections, content, and navigation.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Registration & Participants',
      description:
        'Create registration flows, collect participant information, and manage attendees effortlessly.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Schedules & Sessions',
      description:
        'Organize sessions, venues, speakers, tracks, and schedules in one connected workspace.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Attendance & Check-in',
      description:
        'Make event entry simple with QR check-in, attendance tracking, and session participation.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Communication',
      description:
        'Keep participants informed with announcements, notifications, reminders, and event updates.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Media & Galleries',
      description:
        'Manage event photos, media, participant galleries, and memories in one place.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Feedback & Certificates',
      description:
        'Collect feedback and create certificates for participants after the event.',
      image: 'images/journey/img1.png',
    },
    {
      title: 'Analytics',
      description:
        'Understand registrations, attendance, participation, and overall event performance.',
      image: 'images/journey/img1.png',
    },
  ];

  setActive(index: number): void {
    this.activeFeature.set(index);
  }
}
