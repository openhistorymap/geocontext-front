import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';

describe('MnGeoDatasourcesRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesRegistryService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesRegistryService], (service: MnGeoDatasourcesRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
