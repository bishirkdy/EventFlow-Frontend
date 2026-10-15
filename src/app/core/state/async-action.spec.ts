import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { ApiResponse } from '../models/common';
import { NotificationService } from '../services/ui/notification.service';
import { createAsyncAction } from './async-action';

const ok = <T>(data: T): ApiResponse<T> => ({
  isSuccess: true,
  statusCode: 200,
  message: 'ok',
  data,
  errors: null,
});

describe('createAsyncAction', () => {
  const notification = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    notification.error.mockClear();
    notification.success.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: NotificationService, useValue: notification }],
    });
  });

  it('toggles pending while the request is in flight', () => {
    const response$ = new Subject<ApiResponse<void>>();
    const action = TestBed.runInInjectionContext(() =>
      createAsyncAction(() => response$),
    );

    expect(action.pending()).toBe(false);

    action.run();
    expect(action.pending()).toBe(true);

    response$.next(ok(undefined));
    response$.complete();

    expect(action.pending()).toBe(false);
    expect(action.error()).toBeNull();
  });

  it('passes the response to onSuccess and shows the success message', () => {
    const onSuccess = vi.fn();
    const action = TestBed.runInInjectionContext(() =>
      createAsyncAction(() => of(ok('entity-1')), {
        successMessage: 'Saved.',
        onSuccess,
      }),
    );

    action.run();

    expect(onSuccess).toHaveBeenCalledWith(ok('entity-1'));
    expect(notification.success).toHaveBeenCalledWith('Saved.');
    expect(action.pending()).toBe(false);
  });

  it('records a friendly error message when the request fails', () => {
    const action = TestBed.runInInjectionContext(() =>
      createAsyncAction(() => throwError(() => new Error('nope')), {
        errorFallback: 'Could not save.',
      }),
    );

    action.run();

    expect(action.error()).toBe('Could not save.');
    expect(action.pending()).toBe(false);
    expect(notification.success).not.toHaveBeenCalled();
  });

  it('passes action arguments through to the request factory', () => {
    const factory = vi.fn((_id: string, _name: string) => of(ok(undefined)));
    const action = TestBed.runInInjectionContext(() =>
      createAsyncAction((id: string, name: string) => factory(id, name)),
    );

    action.run('42', 'Venue');

    expect(factory).toHaveBeenCalledWith('42', 'Venue');
  });

  it('clears the previous error when the action runs again', () => {
    let failing = true;
    const action = TestBed.runInInjectionContext(() =>
      createAsyncAction(() =>
        failing ? throwError(() => new Error('nope')) : of(ok(undefined)),
      ),
    );

    action.run();
    expect(action.error()).not.toBeNull();

    failing = false;
    action.run();

    expect(action.error()).toBeNull();
  });
});
