import { TestBed } from '@angular/core/testing';

import { EventFeatureService } from './event-feature.service';

describe('EventFeatureService', () => {
  let service: EventFeatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventFeatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
