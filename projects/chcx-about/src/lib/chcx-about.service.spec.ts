import { TestBed } from '@angular/core/testing';

import { ChcxAboutService } from './chcx-about.service';

describe('ChcxAboutService', () => {
  let service: ChcxAboutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChcxAboutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
