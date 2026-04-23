import { TestBed } from '@angular/core/testing';

import { MnGeoLayersService } from './mn-geo-layers.service';

describe('MnGeoLayersService', () => {
  let service: MnGeoLayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
