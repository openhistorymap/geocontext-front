import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesAgentmapService } from './mn-geo-datasources-agentmap.service';

describe('MnGeoDatasourcesAgentmapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesAgentmapService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesAgentmapService], (service: MnGeoDatasourcesAgentmapService) => {
    expect(service).toBeTruthy();
  }));
});
