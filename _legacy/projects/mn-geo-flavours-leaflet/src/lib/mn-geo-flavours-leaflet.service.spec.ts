import { TestBed, inject } from '@angular/core/testing';

import { MnGeoFlavoursLeafletService } from './mn-geo-flavours-leaflet.service';

describe('MnGeoFlavoursLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoFlavoursLeafletService]
    });
  });

  it('should be created', inject([MnGeoFlavoursLeafletService], (service: MnGeoFlavoursLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
