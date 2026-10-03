import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCertificate } from './my-certificate';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'core/services/ui/notification.service';

describe('MyCertificate', () => {
  let component: MyCertificate;
  let fixture: ComponentFixture<MyCertificate>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCertificate],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
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
    fixture = TestBed.createComponent(MyCertificate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(true);

    httpMock
      .expectOne((req) => req.url.includes('/certificates/my'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: [],
        errors: null,
      });

    expect(component.loading()).toBe(false);
  });

  it('should show empty state when no certificate is issued', () => {
    httpMock
      .expectOne((req) => req.url.includes('/certificates/my'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: [],
        errors: null,
      });

    expect(component.loading()).toBe(false);
    expect(component.certificate()).toBeNull();
  });

  it('should store the certificate when issued', () => {
    httpMock
      .expectOne((req) => req.url.includes('/certificates/my'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: [
          {
            id: 'cert-1',
            eventId: 'event-1',
            registrationId: 'reg-1',
            certificateNumber: 'CERT-20261003-ABC123',
            participantName: 'Ada Lovelace',
            participantEmail: 'ada@example.com',
            eventName: 'TechConf',
            status: 'Generated',
            issuedAtUtc: '2026-10-03T10:00:00Z',
            revokedAtUtc: null,
          },
        ],
        errors: null,
      });

    expect(component.certificate()?.certificateNumber).toBe(
      'CERT-20261003-ABC123'
    );
  });

  it('should format dates safely', () => {
    httpMock
      .expectOne((req) => req.url.includes('/certificates/my'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: [],
        errors: null,
      });

    expect(component.formatDate(null)).toBe('—');
    expect(component.formatDate('2026-10-03T10:00:00Z')).toContain('2026');
  });
});
