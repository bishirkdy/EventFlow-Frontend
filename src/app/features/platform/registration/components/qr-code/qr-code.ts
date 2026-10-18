import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-registration-qr-code',
  standalone: true,
  templateUrl: './qr-code.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeComponent {
  readonly value = input.required<string>();

  protected readonly qrUrl = computed(
    () => `https://quickchart.io/qr?size=360&margin=2&text=${encodeURIComponent(this.value())}`
  );
}
