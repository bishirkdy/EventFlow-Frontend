import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: true,
  template: '',
})
export class Preview implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const eventId = this.route.parent?.snapshot.paramMap.get('eventId');
    if (eventId) {
      void this.router.navigate(['/events', eventId]);
    }
  }
}
