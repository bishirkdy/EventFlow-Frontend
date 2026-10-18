import { assertInInjectionContext, computed, inject, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { NotificationService } from '../services/ui/notification.service';

export interface AsyncAction<Args extends unknown[], Res> {
  readonly pending: Signal<boolean>;
  readonly error: Signal<string | null>;
  run(...args: Args): void;
}

export interface AsyncActionOptions<Res> {
  successMessage?: string;
  onSuccess?: (response: Res) => void;
  onSettled?: () => void;
  onError?: (error: unknown) => void;
  errorFallback?: string;
  toastErrors?: boolean;
}

export function createAsyncAction<Args extends unknown[], Res>(
  fn: (...args: Args) => Observable<Res>,
  options: AsyncActionOptions<Res> = {}
): AsyncAction<Args, Res> {
  assertInInjectionContext(createAsyncAction);

  const notification = inject(NotificationService);
  const untilDestroyed = takeUntilDestroyed<Res>();
  const active = signal(0);
  const error = signal<string | null>(null);

  const run = (...args: Args): void => {
    active.update((count) => count + 1);
    error.set(null);

    fn(...args)
      .pipe(
        untilDestroyed,
        finalize(() => {
          active.update((count) => Math.max(0, count - 1));
          options.onSettled?.();
        })
      )
      .subscribe({
        next: (response) => {
          if (options.successMessage) {
            notification.success(options.successMessage);
          }
          options.onSuccess?.(response);
        },
        error: (requestError: unknown) => {
          const message = getApiErrorMessage(
            requestError,
            options.errorFallback ?? 'Something went wrong.'
          );
          error.set(message);
          if (options.toastErrors) {
            notification.error(message);
          }
          options.onError?.(requestError);
        }
      });
  };

  return {
    pending: computed(() => active() > 0),
    error: error.asReadonly(),
    run
  };
}
