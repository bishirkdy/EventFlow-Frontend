import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/ui/loading.service';

// Session restore calls that run on every page load/boot; they would keep the
// global progress bar flickering even when the page itself is already usable.
const SILENT_URL = /\/v1\/auth\/(profile|refresh)(\?|$)/i;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  if (SILENT_URL.test(req.url)) {
    return next(req);
  }
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
