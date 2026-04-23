import { TestBed, inject } from '@angular/core/testing';

import { MnMapglService } from './mn-mapgl.service';

describe('MnMapglService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnMapglService]
    });
  });

  it('should be created', inject([MnMapglService], (service: MnMapglService) => {
    expect(service).toBeTruthy();
  }));
});
