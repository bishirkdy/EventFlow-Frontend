import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration-preview',
  standalone: true,
  templateUrl: './registration-preview.html',
  styleUrl: './registration-preview.css',
})
export class RegistrationPreviewComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
