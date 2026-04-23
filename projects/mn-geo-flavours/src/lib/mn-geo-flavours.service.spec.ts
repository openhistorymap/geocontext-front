import { TestBed } from '@angular/core/testing';

import { MnGeoFlavoursService } from './mn-geo-flavours.service';

describe('MnGeoFlavoursService', () => {
  let service: MnGeoFlavoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoFlavoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
