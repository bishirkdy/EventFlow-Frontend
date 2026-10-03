import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueDetails } from './venue-details';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('VenueDetails', () => {
  let component: VenueDetails;
  let fixture: ComponentFixture<VenueDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueDetails],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(VenueDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
