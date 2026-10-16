import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Search, X } from 'lucide-angular';
import { EventService } from '../../../core/services/event/event.service';
import { EventTypeService } from '../../../core/services/event-type/event-type.service';
import { Event } from '../../../core/models/event';
import { EventTypeModel } from '../../../core/models/event-type';
import { createAsyncState } from 'core/state';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

type EventSort = 'date-asc' | 'date-desc' | 'name-asc';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule, AsyncState, CapitalizePipe],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly eventTypeService = inject(EventTypeService);

  private readonly eventsState = createAsyncState<Event[]>(
    () => this.eventService.getPublicEvents(12),
    { initial: [], errorFallback: 'Unable to load public events.' },
  );

  private readonly eventTypesState = createAsyncState<EventTypeModel[]>(
    () => this.eventTypeService.getEventTypes(),
    { initial: [] },
  );

  readonly events = this.eventsState.data;
  readonly loading = this.eventsState.loading;
  readonly error = this.eventsState.error;
  readonly eventTypes = this.eventTypesState.data;

  readonly searchIcon = Search;
  readonly clearIcon = X;
  readonly calendarIcon = CalendarDays;

  readonly search = signal('');
  readonly typeFilter = signal('all');
  readonly sort = signal<EventSort>('date-asc');

  readonly filteredEvents = computed(() => {
    const term = this.search().trim().toLowerCase();
    const type = this.typeFilter();

    return this.events()
      .filter((event) => {
        if (type !== 'all' && event.eventType !== type) return false;
        if (!term) return true;
        return (
          event.name.toLowerCase().includes(term) ||
          (event.description ?? '').toLowerCase().includes(term) ||
          (event.subType ?? '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => this.compare(a, b));
  });

  readonly hasActiveFilters = computed(
    () => this.search().trim().length > 0 || this.typeFilter() !== 'all',
  );

  readonly emptyTitle = computed(() =>
    this.hasActiveFilters() ? 'No matching events' : 'No upcoming events',
  );

  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'Try a different search term or clear the filters.'
      : 'Published events will appear here.',
  );

  ngOnInit(): void {
    this.loadEvents();
    this.eventTypesState.load();
  }

  retry(): void {
    this.loadEvents();
  }

  updateSearch(value: string): void {
    this.search.set(value);
  }

  updateType(value: string): void {
    this.typeFilter.set(value);
  }

  updateSort(value: string): void {
    this.sort.set(value as EventSort);
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('all');
  }

  private compare(a: Event, b: Event): number {
    switch (this.sort()) {
      case 'date-desc':
        return this.time(b.startDate) - this.time(a.startDate);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      default:
        return this.time(a.startDate) - this.time(b.startDate);
    }
  }

  private time(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private loadEvents(): void {
    this.eventsState.load();
  }
}
