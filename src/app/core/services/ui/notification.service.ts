import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { getApiErrorMessage } from '../../api/api-error';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  success(message: string, title?: string): void {
    this.show(message, title, 'success');
  }

  info(message: string, title?: string): void {
    this.show(message, title, 'info');
  }

  warning(message: string, title?: string): void {
    this.show(message, title, 'warning');
  }

  error(error: unknown, fallback = 'Something went wrong.'): void {
    const message = typeof error === 'string' ? error : getApiErrorMessage(error, fallback);

    this.show(message, undefined, 'error');
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.document.querySelectorAll('[data-eventflow-toast]').forEach((element) => element.remove());
  }

  private show(
    message: string,
    title: string | undefined,
    type: 'success' | 'info' | 'warning' | 'error',
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.getHost();
    const toast = this.document.createElement('div');
    toast.dataset['eventflowToast'] = 'true';
    toast.className = `eventflow-toast eventflow-toast--${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const content = this.document.createElement('div');
    content.className = 'eventflow-toast__content';

    if (title?.trim()) {
      const heading = this.document.createElement('strong');
      heading.textContent = title.trim();
      content.appendChild(heading);
    }

    const text = this.document.createElement('span');
    text.textContent = message || 'Something went wrong.';
    content.appendChild(text);

    const close = this.document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close notification');
    close.addEventListener('click', () => toast.remove());

    toast.append(content, close);
    host.appendChild(toast);

    window.setTimeout(() => toast.remove(), 3500);
  }

  private getHost(): HTMLElement {
    const existing = this.document.querySelector<HTMLElement>('[data-eventflow-toast-host]');
    if (existing) return existing;

    const host = this.document.createElement('div');
    host.dataset['eventflowToastHost'] = 'true';
    host.className = 'eventflow-toast-host';
    this.document.body.appendChild(host);
    return host;
  }
}
