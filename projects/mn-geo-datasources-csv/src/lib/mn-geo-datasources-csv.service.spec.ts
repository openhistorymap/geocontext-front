import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesCsvService } from './mn-geo-datasources-csv.service';

describe('MnGeoDatasourcesCsvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesCsvService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesCsvService], (service: MnGeoDatasourcesCsvService) => {
    expect(service).toBeTruthy();
  }));
});
