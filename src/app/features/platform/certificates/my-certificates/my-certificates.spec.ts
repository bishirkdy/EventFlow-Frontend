import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MyCertificates } from './my-certificates';
import { provideComponentTestProviders } from '../../../../testing/component-providers';
import { CertificateService } from '../../../../core/services/registration/certificate.service';
import { CertificateModel } from '../../../../core/models/registration/certificate.model';

describe('MyCertificates', () => {
  let component: MyCertificates;
  let fixture: ComponentFixture<MyCertificates>;

  const certificateService = {
    getAllMine: vi.fn(() => of({ data: [] as CertificateModel[] })),
    download: vi.fn(() => of(new Blob())),
  };

  beforeEach(async () => {
    certificateService.getAllMine.mockReturnValue(of({ data: [] }));
    certificateService.download.mockClear();

    await TestBed.configureTestingModule({
      imports: [MyCertificates],
      providers: [
        ...provideComponentTestProviders(),
        { provide: CertificateService, useValue: certificateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCertificates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists every certificate returned for the account', async () => {
    const certificates = [
      {
        id: 'c1',
        eventId: 'evt-1',
        certificateNumber: 'EF-0001',
        eventName: 'Dotnet Conf',
        status: 'Issued',
      },
    ] as CertificateModel[];

    certificateService.getAllMine.mockReturnValue(of({ data: certificates }));
    component.load();
    await fixture.whenStable();

    expect(component.certificates()).toEqual(certificates);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(false);
  });

  it('shows the empty state when no certificates exist', async () => {
    certificateService.getAllMine.mockReturnValue(of({ data: [] }));
    component.load();
    await fixture.whenStable();

    expect(component.certificates()).toEqual([]);
    expect(component.error()).toBe(false);
  });

  it('flags an error when the request fails', async () => {
    certificateService.getAllMine.mockReturnValue(throwError(() => new Error('offline')));
    component.load();
    await fixture.whenStable();

    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('downloads the pdf for a certificate', () => {
    const certificate = {
      id: 'c1',
      eventId: 'evt-1',
      certificateNumber: 'EF-0001',
    } as CertificateModel;

    component.download(certificate);

    expect(certificateService.download).toHaveBeenCalledWith('evt-1', 'c1');
  });
});
