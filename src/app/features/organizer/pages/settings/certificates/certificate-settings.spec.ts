import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificateSettings } from './certificate-settings';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'core/services/ui/notification.service';

describe('CertificateSettings', () => {
  let component: CertificateSettings;
  let fixture: ComponentFixture<CertificateSettings>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateSettings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: null,
            snapshot: {
              paramMap: {
                get: () => 'event-1',
              },
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            error: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CertificateSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne((req) => req.url.includes('/certificates/settings')).flush({
      isSuccess: true,
      statusCode: 200,
      message: 'ok',
      data: {
        eventId: 'event-1',
        title: 'Certificate of Participation',
        subtitle: '',
        signatoryName: null,
        signatoryTitle: null,
        themeColor: '#2563EB',
        requireApprovedRegistration: true,
        minAttendancePercent: null,
        updatedAtUtc: null,
      },
      errors: null,
    });

    httpMock.expectOne((req) => req.url.includes('/certificates')).flush({
      isSuccess: true,
      statusCode: 200,
      message: 'ok',
      data: [],
      errors: null,
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings into the form', () => {
    expect(component.form.title).toBe('Certificate of Participation');
    expect(component.form.themeColor).toBe('#2563EB');
    expect(component.settings()?.eventId).toBe('event-1');
  });

  it('should reject saving when title is empty', () => {
    const notification = TestBed.inject(NotificationService) as any;
    component.form.title = '   ';
    component.saveSettings();
    expect(notification.error).toHaveBeenCalledWith('Certificate title is required.');
  });

  it('should toggle eligibility selection', () => {
    component.toggleSelected('reg-1');
    expect(component.isSelected('reg-1')).toBe(true);
    component.toggleSelected('reg-1');
    expect(component.isSelected('reg-1')).toBe(false);
  });

  it('should require a selection before generating selected', () => {
    const notification = TestBed.inject(NotificationService) as any;
    component.generateSelected();
    expect(notification.error).toHaveBeenCalledWith(
      'Select at least one eligible registration.'
    );
  });

  it('should style revoked status differently', () => {
    expect(component.statusClass('Revoked')).toContain('red');
    expect(component.statusClass('Generated')).toContain('green');
  });
});
