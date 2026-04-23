import { TestBed, inject } from '@angular/core/testing';

import { MnGeoFlavoursMapboxService } from './mn-geo-flavours-mapbox.service';

describe('MnGeoFlavoursMapboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoFlavoursMapboxService]
    });
  });

  it('should be created', inject([MnGeoFlavoursMapboxService], (service: MnGeoFlavoursMapboxService) => {
    expect(service).toBeTruthy();
  }));
});
