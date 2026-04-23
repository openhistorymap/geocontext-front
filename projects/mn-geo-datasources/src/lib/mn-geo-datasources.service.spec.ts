import { TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesService } from './mn-geo-datasources.service';

describe('MnGeoDatasourcesService', () => {
  let service: MnGeoDatasourcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoDatasourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
