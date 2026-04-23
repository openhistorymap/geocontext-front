import { TestBed } from '@angular/core/testing';

import { MnMapglService } from './mn-mapgl.service';

describe('MnMapglService', () => {
  let service: MnMapglService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnMapglService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
