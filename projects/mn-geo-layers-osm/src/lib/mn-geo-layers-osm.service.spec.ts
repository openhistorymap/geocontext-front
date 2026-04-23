import { TestBed } from '@angular/core/testing';

import { MnGeoLayersOsmService } from './mn-geo-layers-osm.service';

describe('MnGeoLayersOsmService', () => {
  let service: MnGeoLayersOsmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersOsmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
