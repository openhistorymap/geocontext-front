import { TestBed, inject } from '@angular/core/testing';

import { MnGeoLayersCartoService } from './mn-geo-layers-carto.service';

describe('MnGeoLayersCartoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoLayersCartoService]
    });
  });

  it('should be created', inject([MnGeoLayersCartoService], (service: MnGeoLayersCartoService) => {
    expect(service).toBeTruthy();
  }));
});
