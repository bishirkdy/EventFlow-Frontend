import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MyRegistrationsComponent } from './my-registrations';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';

describe('MyRegistrationsComponent', () => {
  let component: MyRegistrationsComponent;
  let fixture: ComponentFixture<MyRegistrationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRegistrationsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'event-1' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        {
          provide: RegistrationService,
          useValue: {
            getMine: () => of({ isSuccess: true, statusCode: 200, message: 'Success', data: [], errors: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRegistrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
