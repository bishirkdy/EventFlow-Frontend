import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSettings } from './event-settings';

describe('EventSettings', () => {
  let component: EventSettings;
  let fixture: ComponentFixture<EventSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
