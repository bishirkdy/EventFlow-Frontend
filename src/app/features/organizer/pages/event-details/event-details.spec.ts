import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetails } from './event-details';
import { provideComponentTestProviders } from '../../../../testing/component-providers';

describe('EventDetails', () => {
  let component: EventDetails;
  let fixture: ComponentFixture<EventDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetails],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
