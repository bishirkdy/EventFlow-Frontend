import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  LucideIconData,
  Mail,
  Phone,
  MapPin,
  Clock,
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
  imports: [FormsModule, LucideAngularModule, Button],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  readonly sent = signal(false);

  readonly name = signal('');
  readonly email = signal('');
  readonly subject = signal('');
  readonly message = signal('');

  readonly details: ContactDetail[] = [
    { label: 'Email', value: 'support@eventflow.com', icon: Mail },
    { label: 'Phone', value: '+91 98765 43210', icon: Phone },
    { label: 'Office', value: 'Calicut, Kerala, India', icon: MapPin },
    { label: 'Hours', value: 'Mon – Fri, 9:00 – 18:00', icon: Clock },
  ];

  submit(): void {
    this.sent.set(true);
  }
}
