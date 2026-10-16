import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/components/button/button';

interface SetupStep {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-event-setup',
  standalone: true,
  imports: [RouterLink, Button],
  templateUrl: './event-setup.html',
  styleUrl: './event-setup.css',
})
export class EventSetup {
  readonly steps: SetupStep[] = [
    {
      number: '01',
      title: 'Create your event',
      description:
        'Give your event a name, type and schedule. EventFlow prepares a workspace and a starter website automatically.',
    },
    {
      number: '02',
      title: 'Configure the details',
      description:
        'Set dates, time zone, venues and event settings so participants always see accurate information.',
    },
    {
      number: '03',
      title: 'Build the event website',
      description:
        'Choose pages, sections and navigation, then publish a professional website for your event.',
    },
    {
      number: '04',
      title: 'Turn on the features you need',
      description:
        'Enable registration, schedules, speakers, sponsors, galleries and more with a single switch each.',
    },
    {
      number: '05',
      title: 'Register and check in',
      description:
        'Collect participants, manage attendance with QR check-in and keep everyone informed.',
    },
    {
      number: '06',
      title: 'Capture the moment',
      description:
        'Share photos, collect feedback and issue certificates to wrap up the event experience.',
    },
  ];
}
