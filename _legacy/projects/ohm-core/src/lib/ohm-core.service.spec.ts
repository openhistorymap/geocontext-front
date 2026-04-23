import { TestBed, inject } from '@angular/core/testing';

import { OhmCoreService } from './ohm-core.service';

describe('OhmCoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OhmCoreService]
    });
  });

  it('should be created', inject([OhmCoreService], (service: OhmCoreService) => {
    expect(service).toBeTruthy();
  }));
});
