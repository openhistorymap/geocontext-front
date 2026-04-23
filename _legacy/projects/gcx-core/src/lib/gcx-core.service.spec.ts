import { TestBed, inject } from '@angular/core/testing';

import { GcxCoreService } from './gcx-core.service';

describe('GcxCoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GcxCoreService]
    });
  });

  it('should be created', inject([GcxCoreService], (service: GcxCoreService) => {
    expect(service).toBeTruthy();
  }));
});
