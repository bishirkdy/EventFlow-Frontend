import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PublicRegistrationDetailsComponent } from './registration-details';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';

describe('PublicRegistrationDetailsComponent', () => {
  let component: PublicRegistrationDetailsComponent;
  let fixture: ComponentFixture<PublicRegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicRegistrationDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (key: string) => key === 'eventId' ? 'event-1' : 'registration-1' } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: RegistrationService,
          useValue: {
            getById: () => of({ isSuccess: false, statusCode: 404, message: 'Not found', data: null, errors: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicRegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
