import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CertificateService } from '../../../../core/services/registration/certificate.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { CertificateModel } from '../../../../core/models/registration/certificate.model';

@Component({
  selector: 'app-my-certificates',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-certificates.html',
  styleUrl: './my-certificates.css',
})
export class MyCertificates implements OnInit {
  private readonly certificateService = inject(CertificateService);
  private readonly notification = inject(NotificationService);

  readonly certificates = signal<CertificateModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.certificateService.getAllMine().subscribe({
      next: (response) => {
        this.certificates.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  download(certificate: CertificateModel): void {
    this.certificateService.download(certificate.eventId, certificate.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${certificate.certificateNumber}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.notification.error('Certificate download failed.');
      },
    });
  }
}
