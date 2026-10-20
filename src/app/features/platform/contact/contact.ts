import { Component, computed, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconData,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CalendarDays,
  MessageCircle
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
  styleUrl: './contact.css'
})
export class Contact {
  private static readonly whatsAppNumber = '919048931894';

  readonly whatsappOpened = signal(false);

  readonly name = signal('');
  readonly subject = signal('');
  readonly message = signal('');

  readonly whatsappUrl = computed(() => {
    const text = [
      'Hello EventFlow,',
      '',
      `Name: ${this.name().trim()}`,
      `Subject: ${this.subject().trim() || 'General enquiry'}`,
      '',
      this.message().trim()
    ].join('\n');

    return `https://wa.me/${Contact.whatsAppNumber}?text=${encodeURIComponent(text)}`;
  });

  readonly ArrowRight = ArrowRight;
  readonly CalendarDays = CalendarDays;
  readonly MessageCircle = MessageCircle;

  readonly details: ContactDetail[] = [
    { label: 'Email', value: 'support@eventflow.com', icon: Mail },
    { label: 'Phone', value: '+91 9048931894', icon: Phone },
    { label: 'Office', value: 'Calicut, Kerala, India', icon: MapPin }
  ];

  submit(form: NgForm): void {
    form.control.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    const name = this.name().trim();
    const message = this.message().trim();

    if (!name || !message) {
      return;
    }

    this.name.set(name);
    this.subject.set(this.subject().trim());
    this.message.set(message);
    this.whatsappOpened.set(true);

    window.open(this.whatsappUrl(), '_blank', 'noopener,noreferrer');
  }
}
