import { TestBed } from '@angular/core/testing';

import { MnGeoFlavoursMapboxService } from './mn-geo-flavours-mapbox.service';

describe('MnGeoFlavoursMapboxService', () => {
  let service: MnGeoFlavoursMapboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoFlavoursMapboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
