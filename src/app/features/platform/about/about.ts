import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconData,
  Target,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-angular';

interface AboutValue {
  title: string;
  description: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  readonly ArrowRight = ArrowRight;

  readonly values: AboutValue[] = [
    {
      title: 'Built for organizers',
      description:
        'Every tool in EventFlow starts from a real event problem — planning, registrations, schedules, check-in and follow-ups.',
      icon: Target,
    },
    {
      title: 'Connected experience',
      description:
        'Your event website, participants, media and analytics live in one workspace, so nothing is scattered or lost.',
      icon: Sparkles,
    },
    {
      title: 'Simple by default',
      description:
        'Powerful features stay out of the way until you need them. Anyone can launch a professional event in minutes.',
      icon: Heart,
    },
    {
      title: 'Reliable and secure',
      description:
        'Your data and your participants are handled with care, from role-based access to safe, verified check-in.',
      icon: ShieldCheck,
    },
  ];
}