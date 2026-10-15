import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../../../core/services/ui/loading.service';

const SHOW_DELAY_MS = 150;

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {
  readonly visible = signal(false);

  private readonly activeRequests = inject(LoadingService).loading;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }

    effect((onCleanup) => {
      const active = this.activeRequests() > 0;

      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (active) {
        this.timer = setTimeout(() => this.visible.set(true), SHOW_DELAY_MS);
      } else {
        this.visible.set(false);
      }

      onCleanup(() => {
        if (this.timer !== null) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      });
    });
  }
}
