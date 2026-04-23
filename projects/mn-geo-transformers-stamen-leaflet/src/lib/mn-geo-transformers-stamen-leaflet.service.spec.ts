import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersStamenLeafletService } from './mn-geo-transformers-stamen-leaflet.service';

describe('MnGeoTransformersStamenLeafletService', () => {
  let service: MnGeoTransformersStamenLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersStamenLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
