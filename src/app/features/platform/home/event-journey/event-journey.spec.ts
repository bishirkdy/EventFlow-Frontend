import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventJourney } from './event-journey';

describe('EventJourney', () => {
  let component: EventJourney;
  let fixture: ComponentFixture<EventJourney>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventJourney],
    }).compileComponents();

    fixture = TestBed.createComponent(EventJourney);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
