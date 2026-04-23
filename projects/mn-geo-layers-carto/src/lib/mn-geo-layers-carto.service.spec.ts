import { TestBed } from '@angular/core/testing';

import { MnGeoLayersCartoService } from './mn-geo-layers-carto.service';

describe('MnGeoLayersCartoService', () => {
  let service: MnGeoLayersCartoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersCartoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
