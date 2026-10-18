import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { SectionModel } from '../../../../../core/models/section';
import { SectionService } from '../../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from '@/core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [CapitalizePipe, AsyncState],
  templateUrl: './section-details.html',
  styleUrl: './section-details.css'
})
export class SectionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(NotificationService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  section = signal<SectionModel | null>(null);
  error = signal<string | null>(null);

  private eventId = '';
  private sectionId = '';

  private readonly loadAction = createAsyncAction(
    () => this.sectionService.getSectionById(this.sectionId),
    {
      errorFallback: 'Failed to load section.',
      onError: () => this.error.set('Failed to load section.'),
      onSuccess: (response) => {
        if (!response.data) {
          this.toastr.error('Section data was not returned.');
          return;
        }

        this.section.set(response.data);
      }
    }
  );

  private readonly deleteAction = createAsyncAction(
    () => this.sectionService.deleteSection(this.eventId, this.sectionId),
    {
      successMessage: 'Section deleted successfully.',
      errorFallback: 'Failed to delete section.',
      onSuccess: () => this.goBack()
    }
  );

  loading = this.loadAction.pending;

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sectionId = this.route.snapshot.paramMap.get('sectionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!sectionId) {
      this.error.set('Section ID not found.');
      return;
    }

    this.eventId = eventId;
    this.sectionId = sectionId;

    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loadAction.run();
  }

  editSection(): void {
    this.router.navigate(['/organizer', this.eventId, 'sections', this.sectionId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'sections']);
  }

  deleteSection(): void {
    const confirmed = window.confirm('Are you sure you want to delete this section?');

    if (!confirmed) {
      return;
    }

    this.deleteAction.run();
  }
}
