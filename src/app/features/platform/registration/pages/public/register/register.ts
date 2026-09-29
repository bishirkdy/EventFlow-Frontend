import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));
  protected readonly registrationId = signal(
    this.route.snapshot.paramMap.get('registrationId'),
  );

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
