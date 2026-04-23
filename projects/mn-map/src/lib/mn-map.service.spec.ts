import { TestBed } from '@angular/core/testing';

import { MnMapService } from './mn-map.service';

describe('MnMapService', () => {
  let service: MnMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
