import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { getApiErrorMessage, getApiErrorErrors } from '../api/api-error';
import { NotificationService } from '../services/ui/notification.service';

const AUTH_CREDENTIALS_URL = /\/v1\/auth\/(login|register)(\?|$)/i;

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // GET failures belong to the calling component, which shows an inline
      // error state with a retry button instead of a transient toast.
      if (req.method === 'GET') {
        return throwError(() => error);
      }

      if (error.status === 0) {
        notification.error('Network error. Check your connection and try again.');
        return throwError(() => error);
      }

      // Login/registration failures have no other surface (the forms show no
      // inline error for them), so they always toast, including 401 and
      // validation responses.
      if (AUTH_CREDENTIALS_URL.test(req.url)) {
        notification.error(getApiErrorMessage(error, 'Authentication failed. Please try again.'));
        return throwError(() => error);
      }

      // 401 is owned exclusively by authRefreshInterceptor: it attempts a token
      // refresh first and only sends the user to /login when the refresh fails.
      if (error.status === 401) {
        return throwError(() => error);
      }

      // The API returns field-level validation messages in `errors[]`; forms
      // render those under their inputs, so a toast would be a duplicate.
      if (getApiErrorErrors(error).length > 0) {
        return throwError(() => error);
      }

      notification.error(
        getApiErrorMessage(
          error,
          error.status === 403
            ? 'You do not have permission to perform this action.'
            : 'The request failed. Please try again.',
        ),
      );
      return throwError(() => error);
    }),
  );
};
