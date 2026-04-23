import { TestBed } from '@angular/core/testing';

import { ChcxMainService } from './chcx-main.service';

describe('ChcxMainService', () => {
  let service: ChcxMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChcxMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
