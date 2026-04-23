import { TestBed } from '@angular/core/testing';

import { MnGeoLayersC3dService } from './mn-geo-layers-c3d.service';

describe('MnGeoLayersC3dService', () => {
  let service: MnGeoLayersC3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoLayersC3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
