import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  LucideAngularModule,
  Plus,
  QrCode,
  Trash2
} from 'lucide-angular';
import { CertificateService } from '@/core/services/registration/certificate.service';
import { NotificationService } from '@/core/services/ui/notification.service';
import {
  CertificateFieldAlign,
  CertificateSettingsModel,
  CertificateTemplateFieldModel,
  CertificateTemplateMode
} from '@/core/models/certificate';

interface FieldOption {
  key: string;
  label: string;
}

const FIELD_OPTIONS: FieldOption[] = [
  { key: 'participantName', label: 'Participant name' },
  { key: 'eventTitle', label: 'Event name' },
  { key: 'eventDates', label: 'Event dates' },
  { key: 'title', label: 'Certificate title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'signatoryName', label: 'Signatory name' },
  { key: 'signatoryTitle', label: 'Signatory title' },
  { key: 'issueDate', label: 'Date of issue' },
  { key: 'certificateNumber', label: 'Certificate number' },
  { key: 'verificationQr', label: 'Verification QR' },
  { key: 'customText', label: 'Custom text' }
];

const FIELD_PRESETS: Record<string, Partial<CertificateTemplateFieldModel>> = {
  title: {
    xPercent: 10,
    yPercent: 5,
    widthPercent: 80,
    fontSizePt: 30,
    bold: true,
    fontColor: '#1D4ED8'
  },
  subtitle: { xPercent: 10, yPercent: 15, widthPercent: 80, fontSizePt: 13, fontColor: '#6B7280' },
  customText: {
    xPercent: 20,
    yPercent: 27,
    widthPercent: 60,
    fontSizePt: 14,
    fontColor: '#374151',
    text: 'This is to certify that'
  },
  participantName: {
    xPercent: 10,
    yPercent: 35,
    widthPercent: 80,
    fontSizePt: 36,
    bold: true,
    fontColor: '#111827'
  },
  eventTitle: {
    xPercent: 10,
    yPercent: 52,
    widthPercent: 80,
    fontSizePt: 22,
    bold: true,
    fontColor: '#2563EB'
  },
  eventDates: {
    xPercent: 10,
    yPercent: 62,
    widthPercent: 80,
    fontSizePt: 13,
    fontColor: '#4B5563'
  },
  signatoryName: {
    xPercent: 8,
    yPercent: 82,
    widthPercent: 28,
    fontSizePt: 14,
    bold: true,
    fontColor: '#111827'
  },
  signatoryTitle: {
    xPercent: 8,
    yPercent: 88,
    widthPercent: 28,
    fontSizePt: 11,
    fontColor: '#6B7280'
  },
  issueDate: { xPercent: 70, yPercent: 82, widthPercent: 22, fontSizePt: 12, fontColor: '#111827' },
  certificateNumber: {
    xPercent: 35,
    yPercent: 93,
    widthPercent: 30,
    fontSizePt: 9,
    fontColor: '#6B7280'
  },
  verificationQr: {
    xPercent: 82,
    yPercent: 80,
    widthPercent: 12,
    fontSizePt: 10,
    fontColor: '#111827'
  }
};

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;
const PAGE_HEIGHT_PT = 595;

interface DragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startXPercent: number;
  startYPercent: number;
}

@Component({
  selector: 'app-certificate-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './template-editor.html',
  styleUrl: './template-editor.css'
})
export class CertificateTemplateEditor {
  private readonly certificateService = inject(CertificateService);
  private readonly notification = inject(NotificationService);

  readonly eventId = input.required<string>();
  readonly mode = input<CertificateTemplateMode>('Classic');
  readonly fields = input<CertificateTemplateFieldModel[]>([]);
  readonly imageUrl = input<string | null>(null);
  readonly imageWidth = input<number>(0);
  readonly imageHeight = input<number>(0);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly signatoryName = input<string>('');
  readonly signatoryTitle = input<string>('');

  readonly modeChange = output<CertificateTemplateMode>();
  readonly fieldsChange = output<CertificateTemplateFieldModel[]>();
  readonly imageChanged = output<CertificateSettingsModel>();

  readonly uploading = signal(false);
  readonly selectedKey = signal<string | null>(null);

  readonly fieldOptions = FIELD_OPTIONS;
  readonly fontFamilies = [
    'Lato',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Calibri'
  ];
  readonly aligns: CertificateFieldAlign[] = ['Left', 'Center', 'Right'];

  readonly ImagePlus = ImagePlus;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly QrCode = QrCode;
  readonly Bold = Bold;
  readonly AlignLeft = AlignLeft;
  readonly AlignCenter = AlignCenter;
  readonly AlignRight = AlignRight;

  readonly canvasEl = viewChild<ElementRef<HTMLDivElement>>('canvas');

  private drag: DragState | null = null;

  get availableOptions(): FieldOption[] {
    const used = new Set(this.fields().map((field) => field.key));
    return this.fieldOptions.filter((option) => !used.has(option.key));
  }

  get selected(): CertificateTemplateFieldModel | null {
    const key = this.selectedKey();
    return key ? (this.fields().find((field) => field.key === key) ?? null) : null;
  }

  get canvasAspectRatio(): string {
    const width = this.imageWidth();
    const height = this.imageHeight();
    return width > 0 && height > 0 ? `${width} / ${height}` : '3 / 2';
  }

  get pageWidthPt(): number {
    const width = this.imageWidth();
    const height = this.imageHeight();
    return height > 0 ? (PAGE_HEIGHT_PT * width) / height : PAGE_HEIGHT_PT;
  }

  fontSizeCss(field: CertificateTemplateFieldModel): string {
    return `${((field.fontSizePt * 100) / this.pageWidthPt).toFixed(4)}cqw`;
  }

  fieldLabel(key: string): string {
    return this.fieldOptions.find((option) => option.key === key)?.label ?? key;
  }

  sampleText(field: CertificateTemplateFieldModel): string {
    switch (field.key) {
      case 'customText':
        return field.text ?? '';
      case 'participantName':
        return 'Sample Participant';
      case 'eventTitle':
        return 'Sample Event';
      case 'eventDates':
        return '14 October 2026';
      case 'certificateNumber':
        return 'CERT-20261014-A1B2C3';
      case 'issueDate':
        return new Date().toLocaleDateString();
      case 'signatoryName':
        return this.signatoryName() || 'Signatory name';
      case 'signatoryTitle':
        return this.signatoryTitle() || 'Signatory title';
      case 'title':
        return this.title() || 'Certificate of Participation';
      case 'subtitle':
        return this.subtitle();
      default:
        return '';
    }
  }

  selectField(key: string): void {
    this.selectedKey.set(key);
  }

  addField(key: string): void {
    if (!key || this.fields().some((field) => field.key === key)) {
      return;
    }

    const preset = FIELD_PRESETS[key] ?? {};

    const field: CertificateTemplateFieldModel = {
      key,
      text: null,
      xPercent: 15,
      yPercent: 20,
      widthPercent: 50,
      fontSizePt: 16,
      fontColor: '#111827',
      bold: false,
      align: 'Center',
      fontFamily: 'Lato',
      ...preset
    };

    this.fieldsChange.emit([...this.fields(), field]);
    this.selectedKey.set(key);
  }

  removeField(key: string): void {
    this.fieldsChange.emit(this.fields().filter((field) => field.key !== key));

    if (this.selectedKey() === key) {
      this.selectedKey.set(null);
    }
  }

  patchSelected(patch: Partial<CertificateTemplateFieldModel>): void {
    const key = this.selectedKey();

    if (!key) {
      return;
    }

    this.fieldsChange.emit(
      this.fields().map((field) => (field.key === key ? { ...field, ...patch } : field))
    );
  }

  startDrag(event: PointerEvent, field: CertificateTemplateFieldModel): void {
    event.preventDefault();
    event.stopPropagation();

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.selectedKey.set(field.key);

    this.drag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startXPercent: field.xPercent,
      startYPercent: field.yPercent
    };
  }

  moveDrag(event: PointerEvent): void {
    if (!this.drag || this.drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = this.canvasEl()?.nativeElement.getBoundingClientRect();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const deltaX = ((event.clientX - this.drag.startClientX) / rect.width) * 100;
    const deltaY = ((event.clientY - this.drag.startClientY) / rect.height) * 100;

    this.patchSelected({
      xPercent: clamp(this.drag.startXPercent + deltaX),
      yPercent: clamp(this.drag.startYPercent + deltaY)
    });
  }

  endDrag(event: PointerEvent): void {
    if (this.drag?.pointerId === event.pointerId) {
      this.drag = null;
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    inputElement.value = '';

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.notification.error('Only PNG, JPEG and WebP images are supported.');
      return;
    }

    if (file.size > MAX_BYTES) {
      this.notification.error('The certificate image must be 10 MB or smaller.');
      return;
    }

    this.uploading.set(true);

    this.certificateService.uploadTemplateImage(this.eventId(), file).subscribe({
      next: (response) => {
        this.uploading.set(false);

        if (response.isSuccess && response.data) {
          this.notification.success(response.message || 'Certificate image uploaded.');

          if (this.mode() === 'Classic') {
            this.modeChange.emit('ImageTemplate');
          }

          this.imageChanged.emit(response.data);
        } else {
          this.notification.error(response.message || 'Certificate image upload failed.');
        }
      },
      error: () => {
        this.uploading.set(false);
        this.notification.error('Certificate image upload failed.');
      }
    });
  }

  removeImage(): void {
    this.uploading.set(true);

    this.certificateService.deleteTemplateImage(this.eventId()).subscribe({
      next: (response) => {
        this.uploading.set(false);

        if (response.isSuccess && response.data) {
          this.notification.success(response.message || 'Certificate image removed.');
          this.selectedKey.set(null);
          this.imageChanged.emit(response.data);
        } else {
          this.notification.error(response.message || 'Certificate image removal failed.');
        }
      },
      error: () => {
        this.uploading.set(false);
        this.notification.error('Certificate image removal failed.');
      }
    });
  }
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}
