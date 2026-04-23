import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM3dMapboxService } from './mn-geo-transformers-agentmap-m3d-mapbox.service';

describe('MnGeoTransformersAgentmapM3dMapboxService', () => {
  let service: MnGeoTransformersAgentmapM3dMapboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersAgentmapM3dMapboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
