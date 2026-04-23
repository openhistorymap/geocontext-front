import { TestBed, inject } from '@angular/core/testing';

import { MnGeoModesM2dService } from './mn-geo-modes-m2d.service';

describe('MnGeoModesM2dService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoModesM2dService]
    });
  });

  it('should be created', inject([MnGeoModesM2dService], (service: MnGeoModesM2dService) => {
    expect(service).toBeTruthy();
  }));
});
