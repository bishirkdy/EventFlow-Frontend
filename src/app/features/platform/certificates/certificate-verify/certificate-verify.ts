import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CertificateService } from 'core/services/registration/certificate.service';
import { CertificateVerifyModel } from 'core/models/registration/certificate.model';

@Component({
  selector: 'app-certificate-verify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './certificate-verify.html',
  styleUrl: './certificate-verify.css',
})
export class CertificateVerify implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly result = signal<CertificateVerifyModel | null>(null);

  ngOnInit(): void {
    const certificateNumber =
      this.route.snapshot.paramMap.get('certificateNumber') ?? '';

    if (!certificateNumber) {
      this.loading.set(false);
      this.error.set('Certificate number is missing.');
      return;
    }

    this.certificateService.verify(certificateNumber).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.isSuccess && response.data) {
          this.result.set(response.data);
        } else {
          this.error.set(response.message || 'Certificate not found.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Certificate not found.');
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
