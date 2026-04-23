import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersLeafletService } from './mn-geo-transformers-leaflet.service';

describe('MnGeoTransformersLeafletService', () => {
  let service: MnGeoTransformersLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
