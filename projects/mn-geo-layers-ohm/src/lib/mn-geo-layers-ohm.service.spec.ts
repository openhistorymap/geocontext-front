import { TestBed } from '@angular/core/testing';

import { MnGeoLayersOhmService } from './mn-geo-layers-ohm.service';

describe('MnGeoLayersOhmService', () => {
  let service: MnGeoLayersOhmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersOhmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
