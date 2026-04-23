import { TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesAgentmapService } from './mn-geo-datasources-agentmap.service';

describe('MnGeoDatasourcesAgentmapService', () => {
  let service: MnGeoDatasourcesAgentmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoDatasourcesAgentmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
