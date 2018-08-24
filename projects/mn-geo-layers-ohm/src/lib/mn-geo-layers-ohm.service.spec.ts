import { TestBed, inject } from '@angular/core/testing';

import { MnGeoLayersOhmService } from './mn-geo-layers-ohm.service';

describe('MnGeoLayersOhmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoLayersOhmService]
    });
  });

  it('should be created', inject([MnGeoLayersOhmService], (service: MnGeoLayersOhmService) => {
    expect(service).toBeTruthy();
  }));
});
