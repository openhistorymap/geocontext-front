import { TestBed } from '@angular/core/testing';

import { MnGeoModesService } from './mn-geo-modes.service';

describe('MnGeoModesService', () => {
  let service: MnGeoModesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoModesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
