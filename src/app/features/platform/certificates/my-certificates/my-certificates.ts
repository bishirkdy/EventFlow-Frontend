import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CertificateService } from '../../../../core/services/registration/certificate.service';
import { CertificateModel } from '@/core/models/certificate';
import { map } from 'rxjs';
import { createAsyncAction, createAsyncState } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

@Component({
  selector: 'app-my-certificates',
  imports: [DatePipe, RouterLink, AsyncState, CapitalizePipe],
  templateUrl: './my-certificates.html',
  styleUrl: './my-certificates.css'
})
export class MyCertificates implements OnInit {
  private readonly certificateService = inject(CertificateService);

  private readonly certificatesState = createAsyncState<CertificateModel[]>(
    () => this.certificateService.getAllMine(),
    { initial: [], autoLoad: false }
  );

  private readonly downloadAction = createAsyncAction(
    (certificate: CertificateModel) =>
      this.certificateService
        .download(certificate.eventId, certificate.id)
        .pipe(map((blob) => ({ blob, fileName: `${certificate.certificateNumber}.pdf` }))),
    {
      onSuccess: ({ blob, fileName }) => this.saveBlob(blob, fileName),
      errorFallback: 'Certificate download failed.'
    }
  );

  readonly certificates = this.certificatesState.data;
  readonly loading = this.certificatesState.loading;
  readonly error = this.certificatesState.error;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.certificatesState.load();
  }

  download(certificate: CertificateModel): void {
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
}
