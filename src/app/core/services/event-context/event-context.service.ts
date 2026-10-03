import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { EventService } from '../event/event.service';
import { EventFeatureService } from '../event-feature/event-feature.service';
import { EventRoleService } from '../event-role/event-role.service';
import { Event as EventModel } from '../../models/event/event.model';
import { EventFeatureModel } from '../../models/event-feature/event-feature.model';
import { EventRoleModel } from '../../models/event-role/event-role.model';

export interface EventContextSnapshot {
  event: EventModel | null;
  roles: EventRoleModel[];
  features: EventFeatureModel[];
}

@Injectable({ providedIn: 'root' })
export class EventContextService {
  private readonly eventService = inject(EventService);
  private readonly featureService = inject(EventFeatureService);
  private readonly roleService = inject(EventRoleService);

  private readonly eventSignal = signal<EventModel | null>(null);
  private readonly rolesSignal = signal<EventRoleModel[]>([]);
  private readonly featuresSignal = signal<EventFeatureModel[]>([]);
  private readonly eventIdSignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly event = this.eventSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly features = this.featuresSignal.asReadonly();
  readonly eventId = this.eventIdSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly enabledFeatureCodes = computed(
    () =>
      new Set(
        this.featuresSignal()
          .filter((feature) => feature.isEnabled)
          .map((feature) => feature.featureCode.trim().toLowerCase()),
      ),
  );

  private request$: Observable<EventContextSnapshot> | null = null;

  load(eventId: string): Observable<EventContextSnapshot> {
    if (this.eventIdSignal() === eventId && this.request$) {
      return this.request$;
    }

    if (this.eventIdSignal() === eventId && this.eventSignal()) {
      return of({
        event: this.eventSignal(),
        roles: this.rolesSignal(),
        features: this.featuresSignal(),
      });
    }

    this.eventIdSignal.set(eventId);
    this.eventSignal.set(null);
    this.rolesSignal.set([]);
    this.featuresSignal.set([]);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request = forkJoin({
      event: this.eventService.getEventById(eventId),
      roles: this.roleService.getMyRoles(eventId),
      features: this.featureService.getFeatures(eventId),
    }).pipe(
      map(({ event, roles, features }) => ({
        event: event.data ?? null,
        roles: roles.data ?? [],
        features: features.data ?? [],
      })),
      tap((context) => {
        this.eventSignal.set(context.event);
        this.rolesSignal.set(context.roles);
        this.featuresSignal.set(context.features);
      }),
      catchError((error: unknown) => {
        this.eventSignal.set(null);
        this.rolesSignal.set([]);
        this.featuresSignal.set([]);
        this.errorSignal.set('Unable to load event workspace.');
        this.request$ = null;
        throw error;
      }),
      finalize(() => this.loadingSignal.set(false)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.request$ = request;
    return request;
  }

  refresh(eventId = this.eventIdSignal()): Observable<EventContextSnapshot> | null {
    if (!eventId) return null;

    this.eventSignal.set(null);
    this.request$ = null;
    return this.load(eventId);
  }

  hasFeature(featureCode: string): boolean {
    return this.enabledFeatureCodes().has(featureCode.trim().toLowerCase());
  }

  hasRole(roleName: string): boolean {
    return this.rolesSignal().some(
      (role) => role.roleName.trim().toLowerCase() === roleName.trim().toLowerCase(),
    );
  }

  clear(): void {
    this.request$ = null;
    this.eventIdSignal.set(null);
    this.eventSignal.set(null);
    this.rolesSignal.set([]);
    this.featuresSignal.set([]);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
  }
}
