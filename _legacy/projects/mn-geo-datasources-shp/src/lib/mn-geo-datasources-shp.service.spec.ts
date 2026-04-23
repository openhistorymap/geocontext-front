import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesShpService } from './mn-geo-datasources-shp.service';

describe('MnGeoDatasourcesShpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesShpService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesShpService], (service: MnGeoDatasourcesShpService) => {
    expect(service).toBeTruthy();
  }));
});
