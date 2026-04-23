import { TestBed, inject } from '@angular/core/testing';

import { MnGeoModesM25dService } from './mn-geo-modes-m25d.service';

describe('MnGeoModesM25dService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoModesM25dService]
    });
  });

  it('should be created', inject([MnGeoModesM25dService], (service: MnGeoModesM25dService) => {
    expect(service).toBeTruthy();
  }));
});
