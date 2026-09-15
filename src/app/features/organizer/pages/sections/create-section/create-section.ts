import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';
import { SectionService } from '../../../../../core/services/section/section.service';
import { CreateSectionRequest } from '../../../../../core/models/section/section.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-section',
  imports: [FormsModule],
  templateUrl: './create-section.html',
  styleUrl: './create-section.css',
})
export class CreateSection {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sectionService = inject(SectionService);

  name = '';
  description = '';
  displayOrder = 0;

  loading = signal(false);
  error = signal<string | null>(null);

  create(): void {

    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!this.name.trim()) {
      this.error.set('Section name is required.');
      return;
    }

    const request: CreateSectionRequest = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      displayOrder: this.displayOrder,
    };

    this.loading.set(true);
    this.error.set(null);

    this.sectionService.createSection(eventId, request).subscribe({

      next: () => {
        this.loading.set(false);

        this.router.navigate(['../../'], {
          relativeTo: this.route,
        });
      },

      error: error => {
        console.error('Failed to create section', error);

        this.error.set('Failed to create section.');
        this.loading.set(false);
      },

    });
  }
}
