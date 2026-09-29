import { Component, input } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  templateUrl: './qr-code.html',
  styleUrl: './qr-code.css',
})
export class QrCodeComponent {
  readonly label = input('QR Code');
}
