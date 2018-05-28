import { TestBed, inject } from '@angular/core/testing';

import { MnMapService } from './mn-map.service';

describe('MnMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnMapService]
    });
  });

  it('should be created', inject([MnMapService], (service: MnMapService) => {
    expect(service).toBeTruthy();
  }));
});
