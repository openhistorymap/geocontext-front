import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersC3dM3dLeafletService } from './mn-geo-transformers-c3d-m3d-leaflet.service';

describe('MnGeoTransformersC3dM3dLeafletService', () => {
  let service: MnGeoTransformersC3dM3dLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersC3dM3dLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
