import { TestBed } from '@angular/core/testing';

import { ChcxStaticService } from './chcx-static.service';

describe('ChcxStaticService', () => {
  let service: ChcxStaticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChcxStaticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
