import { TestBed } from '@angular/core/testing';

import { GcxCoreService } from './gcx-core.service';

describe('GcxCoreService', () => {
  let service: GcxCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GcxCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
