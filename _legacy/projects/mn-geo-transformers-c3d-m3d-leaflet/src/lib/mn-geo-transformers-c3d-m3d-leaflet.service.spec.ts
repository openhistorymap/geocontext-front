import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersC3dM3dLeafletService } from './mn-geo-transformers-c3d-m3d-leaflet.service';

describe('MnGeoTransformersC3dM3dLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersC3dM3dLeafletService]
    });
  });

  it('should be created', inject([MnGeoTransformersC3dM3dLeafletService], (service: MnGeoTransformersC3dM3dLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
