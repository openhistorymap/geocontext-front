import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersLeafletService } from './mn-geo-transformers-leaflet.service';

describe('MnGeoTransformersLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersLeafletService]
    });
  });

  it('should be created', inject([MnGeoTransformersLeafletService], (service: MnGeoTransformersLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
