import { TestBed } from '@angular/core/testing';

import { MnGeoLayersStamenService } from './mn-geo-layers-stamen.service';

describe('MnGeoLayersStamenService', () => {
  let service: MnGeoLayersStamenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersStamenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
