import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersMapboxService } from './mn-geo-transformers-mapbox.service';

describe('MnGeoTransformersMapboxService', () => {
  let service: MnGeoTransformersMapboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersMapboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
