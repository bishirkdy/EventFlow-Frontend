import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SectionService } from '../../../../core/services/section/section.service';
import { SectionModel } from '../../../../core/models/section/section.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sections',
  imports: [],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(ToastrService);

  sections = signal<SectionModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private eventId = '';

  ngOnInit(): void {
    this.eventId = this.getEventId();

    if (!this.eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.loadSections();
  }

  loadSections(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sectionService.getSections(this.eventId).subscribe({
      next: (response) => {
        this.sections.set(response.data);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load sections:', error);

        this.error.set('Failed to load sections.');
        this.loading.set(false);
      },
    });
  }

  createSection(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  viewSection(sectionId: string): void {
    this.router.navigate([sectionId], {
      relativeTo: this.route,
    });
  }

  editSection(sectionId: string): void {
    this.router.navigate([sectionId, 'edit'], {
      relativeTo: this.route,
    });
  }

  deleteSection(sectionId: string): void {
    const confirmed = confirm(
      'Are you sure you want to delete this section?'
    );

    if (!confirmed) {
      return;
    }

    this.sectionService
      .deleteSection(this.eventId, sectionId)
      .subscribe({
        next: () => {
          this.toastr.success(
            'Section deleted successfully.'
          );

          this.loadSections();
        },

        error: (error: unknown) => {
          console.error(
            'Failed to delete section:',
            error
          );

          this.toastr.error(
            'Failed to delete section.'
          );
        },
      });
  }

  private getEventId(): string {
    let route: ActivatedRoute | null = this.route;

    while (route) {
      const eventId =
        route.snapshot.paramMap.get('eventId');

      if (eventId) {
        return eventId;
      }

      route = route.parent;
    }

    return '';
  }
}