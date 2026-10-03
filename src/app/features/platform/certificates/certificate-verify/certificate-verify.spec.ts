import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificateVerify } from './certificate-verify';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('CertificateVerify', () => {
  let component: CertificateVerify;
  let fixture: ComponentFixture<CertificateVerify>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateVerify],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'CERT-20261003-ABC123',
              },
            },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CertificateVerify);
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
      .expectOne((req) => req.url.includes('/verify'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: {
          certificateNumber: 'CERT-20261003-ABC123',
          participantName: 'Ada Lovelace',
          eventName: 'TechConf',
          status: 'Generated',
          isValid: true,
          issuedAtUtc: '2026-10-03T10:00:00Z',
          revokedAtUtc: null,
        },
        errors: null,
      });

    expect(component.loading()).toBe(false);
  });

  it('should show a valid certificate on success', () => {
    httpMock
      .expectOne((req) => req.url.includes('/verify'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'Certificate verified.',
        data: {
          certificateNumber: 'CERT-20261003-ABC123',
          participantName: 'Ada Lovelace',
          eventName: 'TechConf',
          status: 'Generated',
          isValid: true,
          issuedAtUtc: '2026-10-03T10:00:00Z',
          revokedAtUtc: null,
        },
        errors: null,
      });

    expect(component.loading()).toBe(false);
    expect(component.result()?.participantName).toBe('Ada Lovelace');
    expect(component.result()?.isValid).toBe(true);
    expect(component.error()).toBe('');
  });

  it('should show an error when the certificate is not found', () => {
    httpMock
      .expectOne((req) => req.url.includes('/verify'))
      .flush(
        {
          isSuccess: false,
          statusCode: 404,
          message: 'Certificate not found.',
          data: null,
          errors: ['Certificate not found.'],
        },
        { status: 404, statusText: 'Not Found' }
      );

    expect(component.loading()).toBe(false);
    expect(component.result()).toBeNull();
    expect(component.error()).toBe('Certificate not found.');
  });
});
