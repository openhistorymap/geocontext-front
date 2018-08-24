import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersMapboxService } from './mn-geo-transformers-mapbox.service';

describe('MnGeoTransformersMapboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersMapboxService]
    });
  });

  it('should be created', inject([MnGeoTransformersMapboxService], (service: MnGeoTransformersMapboxService) => {
    expect(service).toBeTruthy();
  }));
});
