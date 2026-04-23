import { TestBed, inject } from '@angular/core/testing';

import { MnGeoFlavoursRegistryService } from './mn-geo-flavours-registry.service';

describe('MnGeoFlavoursRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoFlavoursRegistryService]
    });
  });

  it('should be created', inject([MnGeoFlavoursRegistryService], (service: MnGeoFlavoursRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
