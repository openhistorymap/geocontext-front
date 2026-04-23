import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersService } from './mn-geo-transformers.service';

describe('MnGeoTransformersService', () => {
  let service: MnGeoTransformersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
