import { Injectable } from '@angular/core';


@Injectable()
export class ServerToastrService {
  success(_message?: string, _title?: string, _override?: unknown): void {}
  info(_message?: string, _title?: string, _override?: unknown): void {}
  warning(_message?: string, _title?: string, _override?: unknown): void {}
  error(_message?: string, _title?: string, _override?: unknown): void {}
  clear(): void {}
  clearAll(): void {}
}
