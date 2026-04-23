import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesConfRegistryService } from './mn-geo-datasources-conf-registry.service';

describe('MnGeoDatasourcesConfRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesConfRegistryService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesConfRegistryService], (service: MnGeoDatasourcesConfRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
