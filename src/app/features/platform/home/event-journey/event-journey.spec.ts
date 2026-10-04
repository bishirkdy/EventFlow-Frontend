import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventJourney } from './event-journey';

describe('EventJourney', () => {
  let component: EventJourney;
  let fixture: ComponentFixture<EventJourney>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
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
