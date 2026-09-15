import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionService } from '../../../../core/services/section/section.service';
import { SectionModel } from '../../../../core/models/section/section.model';

@Component({
  selector: 'app-sections',
  imports: [],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections {
  private route = inject(ActivatedRoute);
  private sectionService = inject(SectionService);

  sections = signal<SectionModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.sectionService.getSections(eventId).subscribe({
      next: response => {
        this.sections.set(response.data);
        this.loading.set(false);
      },

      error: error => {
        console.error('Failed to load sections', error);
        this.error.set('Failed to load sections.');
        this.loading.set(false);
      },
    });
  }
}
