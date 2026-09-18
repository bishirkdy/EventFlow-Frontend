import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute , Router  } from '@angular/router';
import { SectionService } from '../../../../../core/services/section/section.service';
import { SectionModel } from '../../../../../core/models/section/section.model';

@Component({
  selector: 'app-section-details',
  imports: [],
  templateUrl: './section-details.html',
  styleUrl: './section-details.css',
})
export class SectionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);

  section = signal<SectionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.getEventId();
    const sectionId = this.route.snapshot.paramMap.get('sectionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    if (!sectionId) {
      this.error.set('Section ID not found.');
      this.loading.set(false);
      return;
    }

    this.sectionService.getSectionById(eventId, sectionId).subscribe({
      next: (response) => {
        this.section.set(response.data);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load section:', error);

        this.error.set('Failed to load section.');
        this.loading.set(false);
      },
    });
  }

  private getEventId(): string {
    let route: ActivatedRoute | null = this.route;

    while (route) {
      const eventId = route.snapshot.paramMap.get('eventId');

      if (eventId) {
        return eventId;
      }

      route = route.parent;
    }

    return '';
  }

    backToSections(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }


  editSection(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
    });
  }
}
