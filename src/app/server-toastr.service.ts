import { Injectable } from '@angular/core';

/**
 * SSR-safe no-op replacement for ngx-toastr.
 * ngx-toastr accesses browser globals such as `window`, which do not exist
 * in the Node.js SSR runtime. Browser rendering continues to use ToastrService.
 */
@Injectable()
export class ServerToastrService {
  success(_message?: string, _title?: string, _override?: unknown): void {}
  info(_message?: string, _title?: string, _override?: unknown): void {}
  warning(_message?: string, _title?: string, _override?: unknown): void {}
  error(_message?: string, _title?: string, _override?: unknown): void {}
  clear(): void {}
  clearAll(): void {}
}
