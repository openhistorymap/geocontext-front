import { TestBed, inject } from '@angular/core/testing';

import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';

describe('MnGeoLayersRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoLayersRegistryService]
    });
  });

  it('should be created', inject([MnGeoLayersRegistryService], (service: MnGeoLayersRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
