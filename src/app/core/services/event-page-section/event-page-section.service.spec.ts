import { TestBed } from '@angular/core/testing';

import { EventPageSectionService } from './event-page-section.service';

describe('EventPageSectionService', () => {
  let service: EventPageSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventPageSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
