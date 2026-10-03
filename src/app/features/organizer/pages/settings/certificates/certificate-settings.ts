import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CertificateService } from 'core/services/registration/certificate.service';
import { NotificationService } from 'core/services/ui/notification.service';
import {
  CertificateEligibilityModel,
  CertificateModel,
  CertificateSettingsModel,
} from 'core/models/registration/certificate.model';

interface SettingsForm {
  title: string;
  subtitle: string;
  signatoryName: string;
  signatoryTitle: string;
  themeColor: string;
  requireApprovedRegistration: boolean;
  minAttendancePercent: number | null;
}

@Component({
  selector: 'app-certificate-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-settings.html',
  styleUrl: './certificate-settings.css',
})
export class CertificateSettings implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal('');
  readonly settings = signal<CertificateSettingsModel | null>(null);
  readonly eligibility = signal<CertificateEligibilityModel | null>(null);
  readonly issued = signal<CertificateModel[]>([]);
  readonly selected = signal<Set<string>>(new Set());

  readonly loadingSettings = signal(true);
  readonly savingSettings = signal(false);
  readonly loadingEligibility = signal(false);
  readonly loadingIssued = signal(true);
  readonly generating = signal(false);

  form: SettingsForm = {
    title: 'Certificate of Participation',
    subtitle: '',
    signatoryName: '',
    signatoryTitle: '',
    themeColor: '#2563EB',
    requireApprovedRegistration: true,
    minAttendancePercent: null,
  };

  ngOnInit(): void {
    const eventId =
      this.route.parent?.snapshot.paramMap.get('eventId') ||
      this.route.snapshot.paramMap.get('eventId');

    if (eventId) {
      this.eventId.set(eventId);
      this.loadSettings();
      this.loadIssued();
    }
  }

  loadSettings(): void {
    this.loadingSettings.set(true);
    this.certificateService.getSettings(this.eventId()).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.settings.set(response.data);
          this.form = {
            title: response.data.title,
            subtitle: response.data.subtitle,
            signatoryName: response.data.signatoryName ?? '',
            signatoryTitle: response.data.signatoryTitle ?? '',
            themeColor: response.data.themeColor,
            requireApprovedRegistration: response.data.requireApprovedRegistration,
            minAttendancePercent: response.data.minAttendancePercent,
          };
        }
        this.loadingSettings.set(false);
      },
      error: () => {
        this.loadingSettings.set(false);
        this.notification.error('Failed to load certificate settings.');
      },
    });
  }

  saveSettings(): void {
    const title = this.form.title.trim();
    if (!title) {
      this.notification.error('Certificate title is required.');
      return;
    }

    if (
      this.form.minAttendancePercent !== null &&
      (this.form.minAttendancePercent < 0 || this.form.minAttendancePercent > 100)
    ) {
      this.notification.error('Minimum attendance must be between 0 and 100.');
      return;
    }

    this.savingSettings.set(true);
    this.certificateService
      .updateSettings(this.eventId(), {
        title,
        subtitle: this.form.subtitle.trim(),
        signatoryName: this.form.signatoryName.trim() || null,
        signatoryTitle: this.form.signatoryTitle.trim() || null,
        themeColor: this.form.themeColor.trim() || '#2563EB',
        requireApprovedRegistration: this.form.requireApprovedRegistration,
        minAttendancePercent: this.form.minAttendancePercent,
      })
      .subscribe({
        next: (response) => {
          this.savingSettings.set(false);
          if (response.isSuccess) {
            this.settings.set(response.data);
            this.notification.success(response.message || 'Settings saved.');
          } else {
            this.notification.error(response.message || 'Failed to save settings.');
          }
        },
        error: () => {
          this.savingSettings.set(false);
          this.notification.error('Failed to save certificate settings.');
        },
      });
  }

  loadEligibility(): void {
    this.loadingEligibility.set(true);
    this.certificateService.getEligibility(this.eventId()).subscribe({
      next: (response) => {
        this.loadingEligibility.set(false);
        if (response.isSuccess && response.data) {
          this.eligibility.set(response.data);
          this.selected.set(new Set());
        }
      },
      error: () => {
        this.loadingEligibility.set(false);
        this.notification.error('Failed to load eligibility preview.');
      },
    });
  }

  loadIssued(): void {
    this.loadingIssued.set(true);
    this.certificateService.list(this.eventId()).subscribe({
      next: (response) => {
        this.loadingIssued.set(false);
        if (response.isSuccess && response.data) {
          this.issued.set(response.data);
        }
      },
      error: () => {
        this.loadingIssued.set(false);
        this.notification.error('Failed to load issued certificates.');
      },
    });
  }

  toggleSelected(registrationId: string): void {
    const next = new Set(this.selected());
    if (next.has(registrationId)) {
      next.delete(registrationId);
    } else {
      next.add(registrationId);
    }
    this.selected.set(next);
  }

  isSelected(registrationId: string): boolean {
    return this.selected().has(registrationId);
  }

  generateAllEligible(): void {
    this.generate({ registrationIds: null });
  }

  generateSelected(): void {
    const ids = Array.from(this.selected());
    if (ids.length === 0) {
      this.notification.error('Select at least one eligible registration.');
      return;
    }
    this.generate({ registrationIds: ids });
  }

  private generate(request: { registrationIds: string[] | null }): void {
    this.generating.set(true);
    this.certificateService.generate(this.eventId(), request).subscribe({
      next: (response) => {
        this.generating.set(false);
        if (response.isSuccess && response.data) {
          const result = response.data;
          this.notification.success(
            `Generated ${result.generated}, skipped ${result.skipped}` +
              (result.failed > 0 ? `, failed ${result.failed}` : '') +
              '.'
          );
          this.loadIssued();
          this.loadEligibility();
        } else {
          this.notification.error(response.message || 'Generation failed.');
        }
      },
      error: () => {
        this.generating.set(false);
        this.notification.error('Certificate generation failed.');
      },
    });
  }

  download(certificate: CertificateModel): void {
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

  revoke(certificate: CertificateModel): void {
    this.certificateService.revoke(this.eventId(), certificate.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.notification.success(response.message || 'Certificate revoked.');
          this.loadIssued();
          this.loadEligibility();
        } else {
          this.notification.error(response.message || 'Failed to revoke certificate.');
        }
      },
      error: () => {
        this.notification.error('Failed to revoke certificate.');
      },
    });
  }

  refreshAll(): void {
    this.loadIssued();
    this.loadEligibility();
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  statusClass(status: string): string {
    return status === 'Revoked'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  }
}
