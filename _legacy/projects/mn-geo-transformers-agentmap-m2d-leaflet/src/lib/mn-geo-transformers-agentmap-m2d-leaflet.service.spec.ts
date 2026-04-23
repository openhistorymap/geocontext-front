import { TestBed, inject } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM2dLeafletService } from './mn-geo-transformers-agentmap-m2d-leaflet.service';

describe('MnGeoTransformersAgentmapM2dLeafletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoTransformersAgentmapM2dLeafletService]
    });
  });

  it('should be created', inject([MnGeoTransformersAgentmapM2dLeafletService], (service: MnGeoTransformersAgentmapM2dLeafletService) => {
    expect(service).toBeTruthy();
  }));
});
