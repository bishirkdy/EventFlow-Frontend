import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVenue } from './create-venue';

describe('CreateVenue', () => {
  let component: CreateVenue;
  let fixture: ComponentFixture<CreateVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVenue],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateVenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
