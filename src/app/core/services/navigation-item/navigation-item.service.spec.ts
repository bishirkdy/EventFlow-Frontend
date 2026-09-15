import { TestBed } from '@angular/core/testing';

import { NavigationItemService } from './navigation-item.service';

describe('NavigationItemService', () => {
  let service: NavigationItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
