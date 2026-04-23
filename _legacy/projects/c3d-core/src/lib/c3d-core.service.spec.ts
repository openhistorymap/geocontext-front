import { TestBed, inject } from '@angular/core/testing';

import { C3dCoreService } from './c3d-core.service';

describe('C3dCoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [C3dCoreService]
    });
  });

  it('should be created', inject([C3dCoreService], (service: C3dCoreService) => {
    expect(service).toBeTruthy();
  }));
});
