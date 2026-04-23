import { TestBed, inject } from '@angular/core/testing';

import { MnCachingService } from './mn-caching.service';

describe('MnCachingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnCachingService]
    });
  });

  it('should be created', inject([MnCachingService], (service: MnCachingService) => {
    expect(service).toBeTruthy();
  }));
});
