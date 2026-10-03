import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CertificateService } from 'core/services/registration/certificate.service';
import { NotificationService } from 'core/services/ui/notification.service';
import { CertificateModel } from 'core/models/registration/certificate.model';

@Component({
  selector: 'app-my-certificate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-certificate.html',
  styleUrl: './my-certificate.css',
})
export class MyCertificate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal('');
  readonly certificate = signal<CertificateModel | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.certificateService.getMine(this.eventId()).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.certificate.set(response.data[0]);
        } else {
          this.certificate.set(null);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load your certificate.');
      },
    });
  }

  download(): void {
    const certificate = this.certificate();
    if (!certificate) return;

    this.certificateService.download(this.eventId(), certificate.id).subscribe({
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

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
