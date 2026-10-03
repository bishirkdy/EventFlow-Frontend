import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEvents } from './upcoming-events';
import { provideComponentTestProviders } from '../../../../testing/component-providers';

describe('UpcomingEvents', () => {
  let component: UpcomingEvents;
  let fixture: ComponentFixture<UpcomingEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEvents],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
