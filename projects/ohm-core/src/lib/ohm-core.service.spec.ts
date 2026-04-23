import { TestBed } from '@angular/core/testing';

import { OhmCoreService } from './ohm-core.service';

describe('OhmCoreService', () => {
  let service: OhmCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OhmCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
