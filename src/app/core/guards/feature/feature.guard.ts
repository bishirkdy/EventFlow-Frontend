import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EventFeatureService } from '../../services/event-feature/event-feature.service';

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
  const eventId = eventIdFrom(route);
  if (!eventId) return false;
  return featureService.getFeatures(eventId).pipe(
    map(response => {
      const enabled = (response.data ?? []).some(f => f.isEnabled && f.featureCode.toLowerCase() === featureCode.toLowerCase());
      if (!enabled) router.navigate(['/organizer', eventId, 'overview']);
      return enabled;
    }),
    catchError(() => { router.navigate(['/organizer', eventId, 'overview']); return of(false); }),
  );
};
