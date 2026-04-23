import { TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesShpService } from './mn-geo-datasources-shp.service';

describe('MnGeoDatasourcesShpService', () => {
  let service: MnGeoDatasourcesShpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoDatasourcesShpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
