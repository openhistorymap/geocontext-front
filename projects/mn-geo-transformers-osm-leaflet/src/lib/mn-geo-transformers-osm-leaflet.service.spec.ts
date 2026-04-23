import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersOsmLeafletService } from './mn-geo-transformers-osm-leaflet.service';

describe('MnGeoTransformersOsmLeafletService', () => {
  let service: MnGeoTransformersOsmLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersOsmLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
