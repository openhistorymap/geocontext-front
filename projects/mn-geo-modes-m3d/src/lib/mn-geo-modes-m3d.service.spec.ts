import { TestBed } from '@angular/core/testing';

import { MnGeoModesM3dService } from './mn-geo-modes-m3d.service';

describe('MnGeoModesM3dService', () => {
  let service: MnGeoModesM3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoModesM3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
