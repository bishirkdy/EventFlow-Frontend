import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/common/api-response';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  if (error instanceof HttpErrorResponse) {
    const response =
      error.error as Partial<ApiResponse<unknown>> | null | undefined;

    if (response?.errors?.length) {
      return response.errors.join(' ');
    }

    if (response?.message) {
      return response.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
}

export function getApiErrorErrors(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    const response =
      error.error as Partial<ApiResponse<unknown>> | null | undefined;

    return response?.errors ?? [];
  }

  return [];
}
