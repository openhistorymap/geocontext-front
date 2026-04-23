import { TestBed } from '@angular/core/testing';

import { MnGeoModesM25dService } from './mn-geo-modes-m25d.service';

describe('MnGeoModesM25dService', () => {
  let service: MnGeoModesM25dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoModesM25dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
