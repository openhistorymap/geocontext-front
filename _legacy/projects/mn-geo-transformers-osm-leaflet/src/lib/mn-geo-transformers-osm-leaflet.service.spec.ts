import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersOsmLeafletService } from './mn-geo-transformers-osm-leaflet.service';

describe('MnGeoTransformersOsmLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersOsmLeafletService]
    });
  });

  it('should be created', inject([MnGeoTransformersOsmLeafletService], (service: MnGeoTransformersOsmLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
