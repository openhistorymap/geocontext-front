import { TestBed } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM2dLeafletService } from './mn-geo-transformers-agentmap-m2d-leaflet.service';

describe('MnGeoTransformersAgentmapM2dLeafletService', () => {
  let service: MnGeoTransformersAgentmapM2dLeafletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoTransformersAgentmapM2dLeafletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
