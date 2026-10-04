import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { NotificationService } from '../services/ui/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      // 401 is owned exclusively by authRefreshInterceptor: it attempts a token
      // refresh first and only sends the user to /login when the refresh fails.
      // Handling 401 here as well navigated to /login before the refresh retry
      // could succeed, which kicked logged-in users out on every hard reload.
      if (error.status !== 403) {
        return throwError(() => error);
      }

      notification.error(
        getApiErrorMessage(error, 'You do not have permission to perform this action.'),
      );
      return throwError(() => error);
    }),
  );
};
