import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CertificateService } from 'core/services/registration/certificate.service';
import { CertificateModel } from '@/core/models/certificate';
import { map } from 'rxjs';
import { createAsyncAction, createRawAsyncState } from 'core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-my-certificate',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncState],
  templateUrl: './my-certificate.html',
})

export class MyCertificate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);

  readonly eventId = signal('');

  private readonly certificateState = createRawAsyncState<CertificateModel | null>(
    () =>
      this.certificateService.getMine(this.eventId()).pipe(
        map((response) => (response.data?.length ? response.data[0] : null)),
      ),
    { autoLoad: false, initial: null },
  );

  private readonly downloadAction = createAsyncAction(
    (certificate: CertificateModel) =>
      this.certificateService.download(this.eventId(), certificate.id).pipe(
        map((blob) => ({ blob, fileName: `${certificate.certificateNumber}.pdf` })),
      ),
    {
      onSuccess: ({ blob, fileName }) => this.saveBlob(blob, fileName),
      errorFallback: 'Certificate download failed.',
    },
  );

  readonly loading = this.certificateState.loading;
  readonly certificate = this.certificateState.data;
  readonly error = this.certificateState.error;

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.load();
    }
  }

  load(): void {
    this.certificateState.load();
  }

  download(): void {
    const certificate = this.certificate();
    if (!certificate) return;

    this.downloadAction.run(certificate);
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
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
