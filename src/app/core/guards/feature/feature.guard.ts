import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EventFeatureService } from '../../services/event-feature/event-feature.service';
import { NotificationService } from '../../services/ui/notification.service';

function eventIdFrom(route: ActivatedRouteSnapshot): string | null {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const id = current.paramMap.get('eventId');
    if (id) return id;
    current = current.parent;
  }
  return null;
}

export const eventFeatureGuard = (featureCode: string): CanActivateFn => (route) => {
  const featureService = inject(EventFeatureService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const eventId = eventIdFrom(route);
  if (!eventId) return false;

  const block = () => {
    notification.error(
      `The ${featureCode} feature is switched off for this event. Turn it on from Features to use this page.`,
    );
    void router.navigate(['/organizer', eventId, 'overview']);
    return false;
  };

  return featureService.getFeatures(eventId).pipe(
    map(response => {
      const enabled = (response.data ?? []).some(
        f => f.isEnabled && f.featureCode.toLowerCase() === featureCode.toLowerCase(),
      );
      return enabled ? true : block();
    }),
    catchError(() => {
      // If features cannot be loaded, let the organizer in
      // instead of locking them out of their own workspace.
      return of(true);
    }),
  );
};
