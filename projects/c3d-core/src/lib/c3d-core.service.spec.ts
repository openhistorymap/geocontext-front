import { TestBed } from '@angular/core/testing';

import { C3dCoreService } from './c3d-core.service';

describe('C3dCoreService', () => {
  let service: C3dCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(C3dCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
