import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconData,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CalendarDays,
  CheckCircle,
} from 'lucide-angular';
import { Button } from '../../../shared/components/button/button';

interface ContactDetail {
  label: string;
  value: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, Button],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  readonly sent = signal(false);

  readonly name = signal('');
  readonly email = signal('');
  readonly subject = signal('');
  readonly message = signal('');

  readonly ArrowRight = ArrowRight;
  readonly CalendarDays = CalendarDays;
  readonly CheckCircle = CheckCircle;

  readonly details: ContactDetail[] = [
    { label: 'Email', value: 'support@eventflow.com', icon: Mail },
    { label: 'Phone', value: '+91 9048931894', icon: Phone },
    { label: 'Office', value: 'Calicut, Kerala, India', icon: MapPin },
  ];

  submit(): void {
    this.sent.set(true);
  }
}