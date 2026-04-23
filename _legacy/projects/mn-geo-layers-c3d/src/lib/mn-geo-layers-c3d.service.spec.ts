import { TestBed, inject } from '@angular/core/testing';

import { MnGeoLayersC3dService } from './mn-geo-layers-c3d.service';

describe('MnGeoLayersC3dService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoLayersC3dService]
    });
  });

  it('should be created', inject([MnGeoLayersC3dService], (service: MnGeoLayersC3dService) => {
    expect(service).toBeTruthy();
  }));
});
