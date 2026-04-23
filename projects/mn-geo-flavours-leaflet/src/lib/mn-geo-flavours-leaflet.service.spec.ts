import { TestBed } from '@angular/core/testing';

import { MnGeoFlavoursLeafletService } from './mn-geo-flavours-leaflet.service';

describe('MnGeoFlavoursLeafletService', () => {
  let service: MnGeoFlavoursLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoFlavoursLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
