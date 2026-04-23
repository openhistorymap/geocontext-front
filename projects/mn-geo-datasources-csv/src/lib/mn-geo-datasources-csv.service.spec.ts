import { TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesCsvService } from './mn-geo-datasources-csv.service';

describe('MnGeoDatasourcesCsvService', () => {
  let service: MnGeoDatasourcesCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoDatasourcesCsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
