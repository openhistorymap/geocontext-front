import { TestBed, inject } from '@angular/core/testing';

import { MnGeoModesRegistryService } from './mn-geo-modes-registry.service';

describe('MnGeoModesRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoModesRegistryService]
    });
  });

  it('should be created', inject([MnGeoModesRegistryService], (service: MnGeoModesRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
