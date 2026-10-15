import { assertInInjectionContext, computed, inject, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { ApiResponse } from '../models/common';
import { NotificationService } from '../services/ui/notification.service';

export interface AsyncAction<Args extends unknown[], R> {
  readonly pending: Signal<boolean>;
  readonly error: Signal<string | null>;
  run(...args: Args): void;
}

export interface AsyncActionOptions<R> {
  successMessage?: string;
  onSuccess?: (response: ApiResponse<R>) => void;
  onSettled?: () => void;
  errorFallback?: string;
}

export function createAsyncAction<Args extends unknown[], R>(
  fn: (...args: Args) => Observable<ApiResponse<R>>,
  options: AsyncActionOptions<R> = {},
): AsyncAction<Args, R> {
  assertInInjectionContext(createAsyncAction);

  const notification = inject(NotificationService);
  const untilDestroyed = takeUntilDestroyed<ApiResponse<R>>();
  const active = signal(0);
  const error = signal<string | null>(null);

  const run = (...args: Args): void => {
    active.update((count) => count + 1);
    error.set(null);

    fn(...args)
      .pipe(
        untilDestroyed,
        finalize(() => active.update((count) => Math.max(0, count - 1))),
      )
      .subscribe({
        next: (response) => {
          if (options.successMessage) {
            notification.success(options.successMessage);
          }
          options.onSuccess?.(response);
        },
        error: (requestError: unknown) => {
          error.set(
            getApiErrorMessage(requestError, options.errorFallback ?? 'Something went wrong.'),
          );
        },
        complete: () => options.onSettled?.(),
      });
  };

  return {
    pending: computed(() => active() > 0),
    error: error.asReadonly(),
    run,
  };
}
