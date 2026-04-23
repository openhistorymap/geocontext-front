import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersStamenLeafletService } from './mn-geo-transformers-stamen-leaflet.service';

describe('MnGeoTransformersStamenLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersStamenLeafletService]
    });
  });

  it('should be created', inject([MnGeoTransformersStamenLeafletService], (service: MnGeoTransformersStamenLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
