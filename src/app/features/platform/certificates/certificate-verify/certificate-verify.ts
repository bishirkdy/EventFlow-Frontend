import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CertificateService } from 'core/services/registration/certificate.service';
import { CertificateVerifyModel } from '@/core/models/certificate';
import { ApiResponse } from '@/core/models/common';
import { createRawAsyncState } from 'core/state';

@Component({
  selector: 'app-certificate-verify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './certificate-verify.html',
})

export class CertificateVerify implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);

  private certificateNumber = '';
  private readonly paramError = signal('');

  private readonly verifyState = createRawAsyncState<ApiResponse<CertificateVerifyModel>>(
    () => this.certificateService.verify(this.certificateNumber),
    { autoLoad: false, errorFallback: 'Certificate not found.' },
  );

  readonly loading = this.verifyState.loading;
  readonly result = computed(() => {
    const response = this.verifyState.data();
    return response?.isSuccess ? response.data ?? null : null;
  });
  readonly error = computed<string>(() => {
    const stateError = this.verifyState.error();
    if (stateError) return stateError;
    if (this.paramError()) return this.paramError();
    const response = this.verifyState.data();
    if (response && !response.isSuccess) {
      return response.message || 'Certificate not found.';
    }
    return '';
  });

  ngOnInit(): void {
    this.certificateNumber =
      this.route.snapshot.paramMap.get('certificateNumber') ?? '';

    if (!this.certificateNumber) {
      this.paramError.set('Certificate number is missing.');
      return;
    }

    this.verifyState.load();
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
