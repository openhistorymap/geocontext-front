import { TestBed } from '@angular/core/testing';

import { MnGeoService } from './mn-geo.service';

describe('MnGeoService', () => {
  let service: MnGeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
