import { TestBed, inject } from '@angular/core/testing';

import { MnGeoModesM3dService } from './mn-geo-modes-m3d.service';

describe('MnGeoModesM3dService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoModesM3dService]
    });
  });

  it('should be created', inject([MnGeoModesM3dService], (service: MnGeoModesM3dService) => {
    expect(service).toBeTruthy();
  }));
});
