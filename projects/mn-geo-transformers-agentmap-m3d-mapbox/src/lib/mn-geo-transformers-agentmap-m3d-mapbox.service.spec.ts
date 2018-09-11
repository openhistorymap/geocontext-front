import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM3dMapboxService } from './mn-geo-transformers-agentmap-m3d-mapbox.service';

describe('MnGeoTransformersAgentmapM3dMapboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersAgentmapM3dMapboxService]
    });
  });

  it('should be created', inject([MnGeoTransformersAgentmapM3dMapboxService], (service: MnGeoTransformersAgentmapM3dMapboxService) => {
    expect(service).toBeTruthy();
  }));
});
