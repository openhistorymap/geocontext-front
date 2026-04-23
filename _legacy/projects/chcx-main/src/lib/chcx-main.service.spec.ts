import { TestBed, inject } from '@angular/core/testing';

import { ChcxMainService } from './chcx-main.service';

describe('ChcxMainService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChcxMainService]
    });
  });

  it('should be created', inject([ChcxMainService], (service: ChcxMainService) => {
    expect(service).toBeTruthy();
  }));
});
