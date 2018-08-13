import { TestBed, inject } from '@angular/core/testing';

import { MnGeoLayersStamenService } from './mn-geo-layers-stamen.service';

describe('MnGeoLayersStamenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoLayersStamenService]
    });
  });

  it('should be created', inject([MnGeoLayersStamenService], (service: MnGeoLayersStamenService) => {
    expect(service).toBeTruthy();
  }));
});
