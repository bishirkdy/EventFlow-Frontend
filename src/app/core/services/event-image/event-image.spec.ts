import { TestBed } from '@angular/core/testing';

import { EventImage } from './event-image';

describe('EventImage', () => {
  let service: EventImage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventImage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
