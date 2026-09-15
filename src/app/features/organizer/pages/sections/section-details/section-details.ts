import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionService } from '../../../../../core/services/section/section.service';
import { SectionModel } from '../../../../../core/models/section/section.model';

@Component({
  selector: 'app-section-details',
  imports: [],
  templateUrl: './section-details.html',
  styleUrl: './section-details.css',
})
export class SectionDetails {
  private route = inject(ActivatedRoute);
  private sectionService = inject(SectionService);

  section = signal<SectionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {

    const sectionId = this.route.snapshot.paramMap.get('sectionId');

    if (!sectionId) {
      this.error.set('Section ID not found.');
      this.loading.set(false);
      return;
    }

    this.sectionService.getSectionById(sectionId).subscribe({

      next: response => {
        this.section.set(response.data);
        this.loading.set(false);
      },

      error: error => {
        console.error('Failed to load section', error);

        this.error.set('Failed to load section.');
        this.loading.set(false);
      },

    });
  }
}
