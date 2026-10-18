import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SectionModel } from '../../../../core/models/section';
import { SectionService } from '../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction, createAsyncState } from 'core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CapitalizePipe, AsyncState],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections implements OnInit {
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  private eventId = '';
  private readonly routeError = signal<string | null>(null);

  private readonly sectionsState = createAsyncState<SectionModel[]>(
    () => this.sectionService.getSections(this.eventId),
    { initial: [], autoLoad: false, errorFallback: 'Failed to load sections.' },
  );

  private readonly deleteAction = createAsyncAction(
    (sectionId: string) => this.sectionService.deleteSection(this.eventId, sectionId),
    {
      successMessage: 'Section deleted successfully.',
      errorFallback: 'Failed to delete section.',
      onSuccess: () => this.loadSections(),
      onSettled: () => this.deleting.set(null),
    },
  );

  sections = this.sectionsState.data;
  loading = this.sectionsState.loading;
  error = computed(() => this.sectionsState.error() ?? this.routeError());
  deleting = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.routeError.set('Event ID not found.');
      return;
    }

    this.eventId = eventId;
    this.loadSections();
  }

  loadSections(): void {
    this.routeError.set(null);
    this.sectionsState.load();
  }

  createSection(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      'create',
    ]);
  }

  viewSection(sectionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      sectionId,
    ]);
  }

  editSection(sectionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      sectionId,
      'edit',
    ]);
  }

  deleteSection(sectionId: string): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this section?'
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(sectionId);

    this.deleteAction.run(sectionId);
  }
}
