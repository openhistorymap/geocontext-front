import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersService } from './mn-geo-transformers.service';

describe('MnGeoTransformersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersService]
    });
  });

  it('should be created', inject([MnGeoTransformersService], (service: MnGeoTransformersService) => {
    expect(service).toBeTruthy();
  }));
});
