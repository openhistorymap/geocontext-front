import { TestBed } from '@angular/core/testing';

import { MnLazyService } from './mn-lazy.service';

describe('MnLazyService', () => {
  let service: MnLazyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnLazyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
