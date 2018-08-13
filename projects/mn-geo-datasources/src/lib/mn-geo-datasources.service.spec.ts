import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesService } from './mn-geo-datasources.service';

describe('MnGeoDatasourcesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesService], (service: MnGeoDatasourcesService) => {
    expect(service).toBeTruthy();
  }));
});
