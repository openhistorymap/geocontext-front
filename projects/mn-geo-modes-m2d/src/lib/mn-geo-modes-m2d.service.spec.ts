import { TestBed } from '@angular/core/testing';

import { MnGeoModesM2dService } from './mn-geo-modes-m2d.service';

describe('MnGeoModesM2dService', () => {
  let service: MnGeoModesM2dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoModesM2dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
