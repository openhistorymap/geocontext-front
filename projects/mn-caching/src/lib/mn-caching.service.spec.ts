import { TestBed } from '@angular/core/testing';

import { MnCachingService } from './mn-caching.service';

describe('MnCachingService', () => {
  let service: MnCachingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnCachingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
